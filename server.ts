import express from "express";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { paymentService } from "./server/payments/PaymentService";
import { PaymentMethod } from "./server/payments/types";

dotenv.config();

const app = express();
app.use(express.json());

// In-memory server cache/order fallback registry
const serverOrders: Map<string, any> = new Map();
const serverPayments: Map<string, any> = new Map();

async function startServer() {
  const PORT = 3000;

  // Lazy initialize GoogleGenAI client
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // --- 1. PUBLIC CONFIGURATION ENDPOINT ---
  app.get("/api/config/public", (req, res) => {
    res.json({
      appName: "eMakethe",
      country: "Eswatini",
      currency: "SZL",
      currencySymbol: "E",
      supportPhone: "+268 7600 0000",
      paymentMethods: paymentService.getAvailableMethods()
    });
  });

  // --- 2. PAYMENT METHODS LIST ---
  app.get("/api/payments/methods", (req, res) => {
    res.json({ methods: paymentService.getAvailableMethods() });
  });

  // --- 3. SERVER-AUTHORITATIVE ORDER CREATION ---
  app.post("/api/orders/create", (req, res) => {
    try {
      const {
        customerId,
        customerName,
        customerPhone,
        sellerId,
        sellerName,
        sellerPhone,
        items,
        deliveryMethod,
        deliveryAddress,
        pickupLocation,
        customerNotes,
        paymentMethod
      } = req.body;

      if (!sellerId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Missing required order items or seller details." });
      }

      // Calculate server-side totals
      let subtotal = 0;
      const validatedItems = items.map((it: any) => {
        const itemPrice = parseFloat(it.price) || 0;
        const qty = parseInt(it.quantity, 10) || 1;
        subtotal += itemPrice * qty;
        return {
          productId: it.productId || it.id || "",
          name: it.name || "Product",
          price: itemPrice,
          currency: "SZL",
          quantity: qty,
          image: it.image || "",
          unit: it.unit || ""
        };
      });

      const deliveryFee = deliveryMethod === "DELIVERY" ? 25.0 : 0.0;
      const total = subtotal + deliveryFee;

      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();

      const newOrder = {
        id: orderId,
        orderNumber,
        customerId: customerId || "guest_buyer",
        customerName: customerName || "Anonymous Buyer",
        customerPhone: customerPhone || "+268 7600 0000",
        sellerId,
        sellerName: sellerName || "Local Trader",
        sellerPhone: sellerPhone || "",
        items: validatedItems,
        subtotal,
        deliveryFee,
        total,
        currency: "SZL",
        paymentMethod: paymentMethod || "MTN_MOMO",
        paymentStatus: "UNPAID",
        orderStatus: "PENDING",
        deliveryMethod: deliveryMethod || "DELIVERY",
        deliveryAddress: deliveryAddress || "",
        pickupLocation: pickupLocation || "",
        customerNotes: customerNotes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      serverOrders.set(orderId, newOrder);
      return res.status(201).json({ order: newOrder });
    } catch (err: any) {
      console.error("Error creating order:", err);
      return res.status(500).json({ error: err.message || "Failed to create order" });
    }
  });

  // --- 4. PAYMENT INITIATION ENDPOINT ---
  app.post("/api/payments/initiate", async (req, res) => {
    try {
      const {
        orderId,
        orderNumber,
        amount,
        paymentMethod,
        customer,
        seller
      } = req.body;

      if (!orderId || !amount || !paymentMethod) {
        return res.status(400).json({ error: "Missing required payment fields (orderId, amount, paymentMethod)" });
      }

      const paymentResult = await paymentService.initiatePayment({
        orderId,
        orderNumber: orderNumber || orderId,
        amount: parseFloat(amount),
        currency: "SZL",
        paymentMethod: paymentMethod as PaymentMethod,
        customer: customer || { id: "guest", name: "Buyer", phone: "+268 7600 0000" },
        seller: seller || { id: "seller", name: "Trader" }
      });

      // Update in-memory order status
      const existingOrder = serverOrders.get(orderId);
      if (existingOrder) {
        existingOrder.paymentStatus = paymentResult.status;
        existingOrder.paymentReference = paymentResult.providerReference;
        existingOrder.updatedAt = new Date().toISOString();
        serverOrders.set(orderId, existingOrder);
      }

      const paymentRecord = {
        id: paymentResult.paymentId,
        orderId,
        amount,
        currency: "SZL",
        paymentMethod,
        provider: paymentResult.provider,
        providerReference: paymentResult.providerReference,
        status: paymentResult.status,
        createdAt: new Date().toISOString()
      };
      serverPayments.set(paymentResult.paymentId, paymentRecord);

      return res.json(paymentResult);
    } catch (err: any) {
      console.error("Payment Initiation Error:", err);
      return res.status(500).json({ error: err.message || "Failed to initiate payment" });
    }
  });

  // --- 5. PAYMENT STATUS VERIFICATION / POLLING ---
  app.get("/api/payments/verify", async (req, res) => {
    try {
      const { ref, orderId, method } = req.query;
      if (!ref) {
        return res.status(400).json({ error: "Missing provider reference 'ref'" });
      }

      const verifyResult = await paymentService.verifyPayment(
        (method as PaymentMethod) || "MTN_MOMO",
        String(ref),
        orderId ? String(orderId) : undefined
      );

      return res.json(verifyResult);
    } catch (err: any) {
      console.error("Payment Verification Error:", err);
      return res.status(500).json({ error: err.message || "Failed to verify payment" });
    }
  });

  // --- 6. PAYMENT WEBHOOK INGESTION ---
  app.post("/api/payments/webhook/:provider", async (req, res) => {
    try {
      const { provider } = req.params;
      const result = await paymentService.handleWebhook(provider, req.headers, req.body);

      if (result.isValid && result.orderId && result.status) {
        const order = serverOrders.get(result.orderId);
        if (order) {
          order.paymentStatus = result.status;
          if (result.status === "PAID" && order.orderStatus === "PENDING") {
            order.orderStatus = "ACCEPTED";
          }
          order.updatedAt = new Date().toISOString();
          serverOrders.set(result.orderId, order);
        }
      }

      return res.json({ received: true, processed: result.isValid });
    } catch (err: any) {
      console.error("Webhook processing error:", err);
      return res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // --- 7. ORDER STATUS TRANSITION (RBAC) ---
  app.post("/api/orders/:id/status", (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = serverOrders.get(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const validOrderStatuses = [
        "PENDING",
        "ACCEPTED",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
        "READY_FOR_COLLECTION",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED"
      ];

      if (!validOrderStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid order status: ${status}` });
      }

      order.orderStatus = status;
      order.updatedAt = new Date().toISOString();
      serverOrders.set(id, order);

      return res.json({ success: true, order });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to update order status" });
    }
  });

  // --- 8. AI PRODUCT ASSISTANT ENDPOINT ---
  app.post("/api/ai/product-assistant", async (req, res) => {
    try {
      const { userPrompt, category, subcategory, basePrice } = req.body;
      const cleanPrompt = (userPrompt || "").trim();
      const cleanCategory = category || "Agriculture";
      const cleanSub = subcategory || "Vegetables";

      const ai = getAiClient();
      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Help an informal trader write a listing. Input outline: "${cleanPrompt}". Category: ${cleanCategory}, Subcategory: ${cleanSub}. Suggested Base: ${basePrice || "None"}`,
          config: {
            systemInstruction: `You are a helpful AI Product Assistant for eMakethe, a digital marketplace for informal traders in Eswatini and Africa.
Generate a title, a description (highlight Eswatini local value or freshness, keep it inviting), pricing tips in E (Lilangeni), and keywords. Ensure the pricing tips are suitable for Eswatini markets.`,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                suggestedPrice: { type: Type.STRING, description: "Just a recommended number or range (e.g. '18.00' or '15.00 - 20.00')" },
                pricingAnalysis: { type: Type.STRING, description: "Detailed local pricing suggestion explanation in Eswatini Lilangeni (E)" },
                keywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "4 to 6 relevant search tag words"
                }
              },
              required: ["title", "description", "suggestedPrice", "pricingAnalysis", "keywords"]
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json(parsed);
        }
      }

      // Local fallback
      return res.json({
        title: cleanPrompt ? `Fresh ${cleanPrompt}` : "Premium Locally Grown Cabbages",
        description: `Hand-picked directly from Eswatini soil. Fresh, nutritious, and ready for pickup or delivery.`,
        suggestedPrice: basePrice || "15.00",
        pricingAnalysis: "Standard fair market price in Eswatini informal markets.",
        keywords: ["fresh", "eswatini", "local", "traditional", "momo"],
        demoMode: true
      });
    } catch (error: any) {
      console.error("Product Assistant Endpoint Error:", error);
      res.status(500).json({ error: error.message || "Failed to process listing generation" });
    }
  });

  // --- 9. AI SELLER COACH ENDPOINT ---
  app.post("/api/ai/seller-coach", async (req, res) => {
    try {
      const { topic, sellerName } = req.body;
      const cleanTopic = topic || "sales";
      const cleanSeller = sellerName || "Local Trader";

      const ai = getAiClient();
      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Provide advice to the trader "${cleanSeller}" on the topic of: "${cleanTopic}".`,
          config: {
            systemInstruction: `You are the AI Seller Coach for eMakethe, a digital marketplace empowering informal traders in Eswatini and Africa.
Provide actionable, warm, and professional business coaching advice.
Format as JSON object.`,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                tip: { type: Type.STRING },
                checklist: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["title", "tip", "checklist"]
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          return res.json(parsed);
        }
      }

      return res.json({
        title: "Bundle Popular Items for Quick Sales",
        tip: "Package complementary items (like Tomatoes and Onions into a Stew Combo) to increase your average order value.",
        checklist: [
          "Create a bundle listing with a clear photo",
          "Set a convenient price (e.g., E25)",
          "Share on WhatsApp status"
        ],
        demoMode: true
      });
    } catch (error: any) {
      console.error("Seller Coach Endpoint Error:", error);
      res.status(500).json({ error: error.message || "Failed to process coaching session" });
    }
  });

  // --- 10. AI CUSTOMER ASSISTANT ENDPOINT ---
  app.post("/api/ai/customer-assistant", async (req, res) => {
    try {
      const { message } = req.body;
      const cleanMessage = (message || "").trim();

      const ai = getAiClient();
      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: cleanMessage,
          config: {
            systemInstruction: `You are the eMakethe AI Customer Assistant for a digital marketplace in Eswatini. Help buyers find products, understand payments (MTN MoMo, Cards, COD, Collection), and coordinate deliveries.`
          }
        });

        if (response.text) {
          return res.json({ response: response.text.trim() });
        }
      }

      return res.json({
        response: "Yebo! Welcome to eMakethe! I'm your digital marketplace assistant. How can I help you find local goods, coordinate pickup, or pay with MTN MoMo today?",
        demoMode: true
      });
    } catch (error: any) {
      console.error("Customer Assistant Endpoint Error:", error);
      res.status(500).json({ error: error.message || "Failed to process chat response" });
    }
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server successfully running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

export default app;
