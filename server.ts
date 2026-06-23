import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Standard marketplace data summaries to assist AI contexts
const LOCAL_CONTEXT = {
  platformName: "eMakethe & MaketiConnect",
  targetCountry: "Eswatini",
  mainCities: ["Mbabane", "Manzini", "Matsapha", "Ezulwini", "Sidwashini"],
  currency: "Eswatini Lilangeni (E)",
  paymentMethods: ["MTN MoMo (Mobile Money)", "eMakethe Escrow Wallet", "Cash on Hand", "e-Wallet Mobile Payouts"],
  logisticsModels: [
    { name: "Direct Self-Delivery", description: "The seller coordinates transport directly with you" },
    { name: "External Courier Services", description: "Ships via Eswatini Express Courier, FedEx, or regional transport with Waybill tracking ID" },
    { name: "Marketplace Motorcycle Riders", description: "Express 2-hour matching motorcycle delivery service across urban clusters (costs E15 - E25 typically)" }
  ]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parsing
  app.use(express.json());

  // Lazy initialize GoogleGenAI client (robust startup guide)
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY is not defined in environment variables. Operating in smart local fallback mode.");
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

  // --- 1. AI PRODUCT ASSISTANT ENDPOINT ---
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

      // --- ADVANCED LOCAL SMART FALLBACK (IF NO API KEY OR FAILURE) ---
      let fallbackTitle = cleanPrompt ? `Fresh ${cleanPrompt}` : "Premium Locally Grown Cabbages";
      let fallbackDesc = `Hand-picked directly from Eswatini soil near ${LOCAL_CONTEXT.mainCities[Math.floor(Math.random() * LOCAL_CONTEXT.mainCities.length)]}. Highly nutritious, pure, and ready for retail and household cooking. Perfect for traditional meals like chakalaka stews.`;
      let fallbackPrice = basePrice || "15.00";
      let fallbackAnalysis = `Based on local averages across urban markets near Mbabane, selling at E ${fallbackPrice} is standard, offering solid profit return margin for fresh ${cleanSub.toLowerCase()} harvest.`;
      let fallbackKeywords = ["fresh", "eswatini", "local", "traditional", "momo", "organic"];

      if (cleanPrompt.toLowerCase().includes("dress") || cleanCategory.toLowerCase().includes("clothing")) {
        fallbackTitle = `Handcrafted Swazi Print ${cleanPrompt || "Fashion Wear"}`;
        fallbackDesc = "Gorgeous customized piece hand-stitched with vibrant, traditional Swazi print textures. Highly durable fabrics and premium matching colors suitable for formal celebrations or everyday wear.";
        fallbackPrice = basePrice || "350.00";
        fallbackAnalysis = "Typical bespoke custom print fashion wear lists around E 300 to E 450 in urban centers. This is a competitive price reflecting local handcrafted dedication.";
        fallbackKeywords = ["traditional", "dress", "fashion", "swazi", "bespoke", "beadwork"];
      } else if (cleanPrompt.toLowerCase().includes("burger") || cleanPrompt.toLowerCase().includes("food") || cleanCategory.toLowerCase().includes("food")) {
        fallbackTitle = cleanPrompt ? `Savory ${cleanPrompt}` : "Authentic Swazi Mixed Braai Plate";
        fallbackDesc = "Hot flame-grilled street food served with garlic boerewors sausage, charcoal chicken, freshly prepped pap porridge, and local spicy chakalaka salad dressings.";
        fallbackPrice = basePrice || "75.00";
        fallbackAnalysis = "Roadside braai shops typically price mixed platters between E 60 and E 90 in Matsapha and Manzini. Perfect balance of street speed and rich portion sizing.";
        fallbackKeywords = ["braai", "pap", "streetfood", "flame-grilled", "shisanyama", "catering"];
      } else if (cleanPrompt.toLowerCase().includes("phone") || cleanPrompt.toLowerCase().includes("repair") || cleanCategory.toLowerCase().includes("electronics") || cleanCategory.toLowerCase().includes("service")) {
        fallbackTitle = cleanPrompt ? `Premium ${cleanPrompt}` : "Smartphone screen & hardware service";
        fallbackDesc = "Quick troubleshooting and accessory options. Sourcing high-quality replacement parts with express turnaround in Eveni. Reliable diagnostic care and fast WhatsApp coordination.";
        fallbackPrice = basePrice || "180.00";
        fallbackAnalysis = "Technical accessories and repair call-out fees average E 120 to E 250 depending on parts. We recommend outlining options clearly to build client trust.";
        fallbackKeywords = ["repair", "electronics", "spare", "screen-fix", "momo-payout"];
      }

      return res.json({
        title: fallbackTitle,
        description: fallbackDesc,
        suggestedPrice: fallbackPrice,
        pricingAnalysis: fallbackAnalysis,
        keywords: fallbackKeywords,
        demoMode: true
      });

    } catch (error: any) {
      console.error("Product Assistant Endpoint Error:", error);
      res.status(500).json({ error: error.message || "Failed to process listing generation" });
    }
  });


  // --- 2. AI SELLER COACH ENDPOINT ---
  app.post("/api/ai/seller-coach", async (req, res) => {
    try {
      const { topic, sellerName } = req.body;
      const cleanTopic = topic || "sales"; // sales, photos, inventory, service
      const cleanSeller = sellerName || "Sipho's Organic Produce";

      const ai = getAiClient();
      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Provide advice to the trader "${cleanSeller}" on the topic of: "${cleanTopic}".
The topic value corresponds to:
- sales: Increasing Sales
- photos: Better Photos
- inventory: Inventory Management
- service: Customer Service`,
          config: {
            systemInstruction: `You are the AI Seller Coach for eMakethe, a digital marketplace empowering informal traders in Eswatini and Africa.
Provide highly actionable, warm, and professional business coaching advice to help the seller grow their business.
Format your response as a JSON object, utilizing Eswatini slang/terms (e.g. Yebo, MTN MoMo, local riders) to make it friendly and accessible.`,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                tip: { type: Type.STRING, description: "Detailed coaching advice tailored to Eswatini markets" },
                checklist: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "3 clear actionable steps the seller should take today"
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

      // --- SELLER COACH SMART FALLBACKS ---
      const fallbackTips: Record<string, { title: string; tip: string; checklist: string[] }> = {
        sales: {
          title: "Setup 'Stewart Stew Pack' Combos to Increase Sales!",
          tip: "Yebo! A fantastic way to sell more vegetables or meats faster is by creating bundled convenience combos! Combine your Tomatoes and Cabbages together with fresh onions as a single 'Stew Pack' priced at E 35. This saves buyers time choosing single items and pushes your average order size up 25%. Encourage MoMo quick payments by offering a E 2 discount on pre-orders.",
          checklist: [
            "Create a new 'Stew Combo' product in your dashboard containing 3 complementary products.",
            "Write a snippet in the desc highlighting: 'Great for a 4-person family dinner stew.'",
            "Promote this combo on your WhatsApp status and local Facebook buy/sell directories."
          ]
        },
        photos: {
          title: "Utilize Natural Sunlight & Clean Sisal Backgrounds",
          tip: "Eswatini sunlight is gorgeous! Customers buy with their eyes, especially for fresh organic vegetables and custom hand-woven garments. Avoid taking photos late in the evening inside dark rooms. Arrange your products nicely on a clean, light-colored table or a traditional woven Sisal floor mat outside during golden hour (early morning or late afternoon). It makes the colors pop!",
          checklist: [
            "Take your vegetable baskets outside near natural soft shade to capture deep vibrant colors without glare.",
            "Wipe down fruits or tomatoes with a clean damp cloth to give them a natural premium sheen.",
            "Keep the background super clean: clear away background clutter like tools or plastic wraps."
          ]
        },
        inventory: {
          title: "Prep for Payday and Weekend Market Rushes",
          tip: "Informal trade volumes near Mbabane and Manzini double during government/industrial payday cycles (typically around the 23rd to 27th of the month) and weekends. Monitor your local harvests and stock up 30% extra towards Wednesday afternoons. Prep smaller standard baggies of tomatoes (E 10 packs) in advance so you can hand over parcels immediately during peak commute times.",
          checklist: [
            "Review your sales log to identify your fastest-moving item on Friday afternoons.",
            "Bag prep 20 x E10 bags of vegetables before commuters begin returning from offices.",
            "Notify your regular registered recurring buyers via WhatsApp on Thursday that fresh harvest is arriving."
          ]
        },
        service: {
          title: "Leverage eMakethe Escrow to Guarantee Instant Trust",
          tip: "Many online customers are cautious about paying in advance. Reassure them by explaining eMakethe's secure Escrow payment system! Let them know that when they pay via MTN MoMo, our platform holds the funds safely and ONLY distributes them to you when they verify they have received their cabbage or basket in pristine condition. This eliminates all trust hurdles in seconds!",
          checklist: [
            "Respond to fresh customer inquiries within 10 minutes to maintain active engagement.",
            "Use eMakethe's automated WhatsApp dispatch messages to confirm driver dispatch details.",
            "Politely message buyers on delivery: 'Thank you for supporting our local farm! Yebo!'"
          ]
        }
      };

      const finalTip = fallbackTips[cleanTopic] || fallbackTips.sales;
      return res.json({
        ...finalTip,
        demoMode: true
      });

    } catch (error: any) {
      console.error("Seller Coach Endpoint Error:", error);
      res.status(500).json({ error: error.message || "Failed to process coaching session" });
    }
  });


  // --- 3. AI CUSTOMER ASSISTANT ENDPOINT ---
  app.post("/api/ai/customer-assistant", async (req, res) => {
    try {
      const { message, chatHistory, currentItem, currentSeller } = req.body;
      const cleanMessage = (message || "").trim();

      const ai = getAiClient();
      if (ai) {
        // Construct standard conversation stream matching history
        const systemPrompt = `You are the eMakethe AI Customer Assistant, a 24/7 web support assistant helping buyers on our digital marketplace in Eswatini and Africa.
Your goals:
- Answer product queries using the provided live context if relevant.
- Address deliveries (eMakethe matches buyers automatically with nearby motorcycle riders delivering in <2 hours around Mbabane, Manzini, Matsapha for E15 - E25 typically, or matches standard courier templates/self-delivery).
- Explain payments (payments are 100% secure: buyers deposit Lilangeni E via MTN MoMo, Cards, or e-Wallet into the eMakethe Escrow, which holds the payment safely and only releases it to the seller once the customer confirms receiving the items in good order).

Live context (What user is currently viewing):
- Viewed Item: ${currentItem ? JSON.stringify(currentItem) : "None"}
- Seller details: ${currentSeller ? JSON.stringify(currentSeller) : "None"}

Rules: Keep answers friendly, brief, human, and highly professional. Introduce a few polite Eswatini greetings (Yebo, Molo, Siyabonga) to sound local and polite.
Do not output JSON formats. Stand as a natural 24/7 support chat assistant.`;

        const messagesPayload: any[] = [];
        if (chatHistory && Array.isArray(chatHistory)) {
          chatHistory.forEach((h: any) => {
            messagesPayload.push({
              role: h.sender === "user" ? "user" : "model",
              parts: [{ text: h.text }]
            });
          });
        }
        messagesPayload.push({
          role: "user",
          parts: [{ text: cleanMessage }]
        });

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: messagesPayload,
          config: {
            systemInstruction: systemPrompt
          }
        });

        if (response.text) {
          return res.json({ response: response.text.trim() });
        }
      }

      // --- CUSTOMER ASSISTANT SMART FALLBACKS (NLP KEYWORD MATCHING) ---
      const lower = cleanMessage.toLowerCase();
      let responseText = "Yebo! I am your 24/7 eMakethe support assistant. I can answer questions about listing details, secure escrow payments, and motorcycle deliveries around Eswatini. Please let me know how I can guide you today!";

      if (lower.includes("delivery") || lower.includes("ship") || lower.includes("courier") || lower.includes("take") || lower.includes("rider") || lower.includes("motorcycle")) {
        responseText = "Yebo! eMakethe offers rapid, trackable deliveries inside urban centers like Mbabane and Manzini! We support three options: 1) Matched Platform Motorcycle Riders who deliver directly in under 2 hours (costing E15 to E25), 2) Professional external Courier services with Waybill tracking, or 3) Direct trader self-delivery. Which area are you in?";
      } else if (lower.includes("pay") || lower.includes("momo") || lower.includes("escrow") || lower.includes("money") || lower.includes("wallet") || lower.includes("safe") || lower.includes("secure")) {
        responseText = "Siyabonga for asking about payment safety! eMakethe uses a secure Escrow payment ledger. When you place an order, you deposit Lilangeni (E) using MTN MoMo, bank card, or e-Wallet. We hold your payment securely. The trader is notified to dispatch the package, and your money is ONLY released to them after you verify that your cabbages, dress, or smartphone repairs arrived safely. This keeps you 100% safe from fraud!";
      } else if (lower.includes("tomato") || lower.includes("cabbage") || lower.includes("vegetables") || lower.includes("price") || lower.includes("cost") || currentItem) {
        const itemText = currentItem ? `"${currentItem.name}" (priced at ${currentItem.currency} ${currentItem.price} ${currentItem.unit || ""})` : "our listed produce";
        responseText = `Yebo! You are viewing ${itemText}. This is supplied directly by Eswatini local merchants from organic soils. You can order directly by tapping the 'Order into Escrow' button. This holds your payment safely in our Escrow until matching arrival is secured. Tap 'Contact Seller' to discuss bulk orders on WhatsApp!`;
      } else if (lower.includes("how") && lower.includes("order")) {
        responseText = "Ordering is easy or safe! 1) Click 'Order' on any product page, 2) Choose your preferred regional delivery (e.g. Motorcycle match), 3) Pay securely via MTN MoMo into Escrow, 4) Confirm receipt once delivered to get the trader paid. It is simple, friendly, and fully secure!";
      } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("yebo") || lower.includes("molo")) {
        responseText = "Yebo! Hello and welcome to eMakethe! I'm your 24/7 AI Customer assistant. Ask me anything about listed Eswatini products, secure Escrow checkouts, or fast 2-hour delivery riders today!";
      }

      return res.json({
        response: responseText,
        demoMode: true
      });

    } catch (error: any) {
      console.error("Customer Assistant Endpoint Error:", error);
      res.status(500).json({ error: error.message || "Failed to process chat response" });
    }
  });


  // --- VITE MIDDLEWARE SETUP ---
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
    console.log(`Server successfully booted and listening on host 0.0.0.0 and port ${PORT}`);
  });
}

startServer();
