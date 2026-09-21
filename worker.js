const TO_EMAIL = "puredigital@shcasting.online";
const FROM_EMAIL = "puredigital@shcasting.online";

function htmlResponse(title, message, status = 200) {
  return new Response(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | Pure Digital</title>
<style>body{margin:0;background:#fffaf0;color:#172235;font-family:Arial,sans-serif}main{max-width:700px;margin:90px auto;padding:0 24px;text-align:center}h1{color:#08182b;font-size:42px}p{font-size:18px;line-height:1.7}a{display:inline-block;margin-top:20px;padding:13px 22px;background:#f4c84a;color:#08182b;text-decoration:none;font-weight:800;border-radius:10px}</style>
</head><body><main><h1>${title}</h1><p>${message}</p><a href="/">Return to Pure Digital</a></main></body></html>`, {
    status,
    headers: { "Content-Type": "text/html; charset=UTF-8" }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

      try {
        const form = await request.formData();
        const name = String(form.get("name") || "").trim();
        const sender = String(form.get("email") || "").trim();
        const subject = String(form.get("subject") || "").trim();
        const message = String(form.get("message") || "").trim();
        const website = String(form.get("website") || "").trim();

        if (website) return htmlResponse("Message Sent", "Thank you. We received your message.");
        if (!name || !sender || !subject || !message) return htmlResponse("Missing Information", "Please complete all fields and try again.", 400);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sender)) return htmlResponse("Invalid Email", "Please enter a valid email address.", 400);
        if (!env.RESEND_API_KEY) return htmlResponse("Contact Service Not Ready", "Please email puredigital@shcasting.online.", 503);

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: `Pure Digital Website <${FROM_EMAIL}>`,
            to: [TO_EMAIL],
            reply_to: sender,
            subject: `[Pure Digital Website] ${subject}`,
            text: `Name: ${name}\nEmail: ${sender}\nSubject: ${subject}\n\nMessage:\n${message}`
          })
        });

        if (!response.ok) return htmlResponse("Unable to Send", "We couldn't send your message right now. Please email puredigital@shcasting.online.", 502);
        return htmlResponse("Message Sent", "Thank you. Your message has been sent to Pure Digital.");
      } catch {
        return htmlResponse("Something Went Wrong", "Please email puredigital@shcasting.online.", 500);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
