import { useState } from "react";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";

export function ContactView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to send your message.");
      }
      setStatus("success");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Failed to submit enquiry.");
    }
  };

  return (
    <section className="bg-[#FAF8F4]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <div className="max-w-2xl pb-10 border-b border-[#0E0D0C]/10">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#9E7B36] font-semibold">
            Client Concierge
          </p>
          <h1 className="mt-1.5 font-display text-4xl sm:text-5xl font-medium text-[#0E0D0C]">
            Contact ACACIA
          </h1>
          <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-[#6E655B]">
            For bespoke fragrance consultations, wedding gifting orders, or order assistance, leave us a message and our concierge team will respond within one business day.
          </p>
        </div>

        <div className="pt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#0E0D0C]/10 p-6 sm:p-9">
              {status === "success" ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="w-8 h-8 text-[#9E7B36] mx-auto" />
                  <h2 className="mt-4 font-display text-3xl font-medium text-[#0E0D0C]">
                    Enquiry Received
                  </h2>
                  <p className="mt-2 text-sm text-[#6E655B] max-w-md mx-auto">
                    Thank you for reaching out to ACACIA. Your enquiry has been saved for our fragrance concierge team.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="mt-7 px-6 py-3 bg-[#0E0D0C] text-[#FAF8F4] text-xs font-semibold tracking-[0.14em] uppercase"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="font-display text-2xl font-medium text-[#0E0D0C]">
                    Send an Enquiry
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-2"
                      >
                        Customer Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#0E0D0C]/15 text-sm text-[#0E0D0C] focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-2"
                      >
                        Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#0E0D0C]/15 text-sm text-[#0E0D0C] focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300 0000000"
                      className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#0E0D0C]/15 text-sm text-[#0E0D0C] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us which scent notes you gravitate toward or how we may assist you..."
                      className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#0E0D0C]/15 text-sm text-[#0E0D0C] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-xs text-[#8B3A3A] bg-red-50 border border-red-200 p-3">
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#0E0D0C] text-[#FAF8F4] text-xs font-semibold tracking-[0.14em] uppercase hover:bg-[#26231F] transition-colors disabled:opacity-50"
                  >
                    {status === "submitting" ? "Sending..." : "Submit Enquiry"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Direct Atelier Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#EDE6DA]/70 border border-[#0E0D0C]/10 p-6 sm:p-8 space-y-6">
              <h2 className="font-display text-2xl font-medium text-[#0E0D0C]">
                Direct Channels
              </h2>

              <div className="flex items-start gap-3.5">
                <Mail className="w-4 h-4 text-[#9E7B36] mt-1 shrink-0" />
                <div>
                  <p className="text-xs tracking-[0.12em] uppercase font-semibold text-[#6E655B]">
                    Business Email
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#0E0D0C]">
                    concierge@acaciaparfums.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Phone className="w-4 h-4 text-[#9E7B36] mt-1 shrink-0" />
                <div>
                  <p className="text-xs tracking-[0.12em] uppercase font-semibold text-[#6E655B]">
                    Atelier Telephone
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#0E0D0C] tabular-nums">
                    +92 21 3584 0912
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <MapPin className="w-4 h-4 text-[#9E7B36] mt-1 shrink-0" />
                <div>
                  <p className="text-xs tracking-[0.12em] uppercase font-semibold text-[#6E655B]">
                    Flagship Salon
                  </p>
                  <p className="mt-1 text-sm text-[#0E0D0C] leading-relaxed">
                    Suite 4, Clifton Block 4, Marine Promenade, Karachi · Mon–Sat, 11:00 AM – 8:00 PM
                  </p>
                </div>
              </div>

              <div className="pt-5 border-t border-[#0E0D0C]/10">
                <p className="text-xs tracking-[0.12em] uppercase font-semibold text-[#6E655B] mb-3">
                  Social Channels
                </p>
                <div className="flex flex-wrap gap-4 text-sm font-medium text-[#0E0D0C]">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-[#C5A059] underline-offset-4 hover:text-[#9E7B36]"
                  >
                    Instagram @acaciaparfums
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-[#C5A059] underline-offset-4 hover:text-[#9E7B36]"
                  >
                    Facebook
                  </a>
                  <a
                    href="https://pinterest.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-[#C5A059] underline-offset-4 hover:text-[#9E7B36]"
                  >
                    Pinterest
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
