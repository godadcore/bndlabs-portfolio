import { useEffect, useRef, useState } from "react";
import { makeContactPayload, submitContactForm } from "../../lib/contactForm";

export default function ContactSection({ scrollRootRef }) {
  const sectionRef = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ type: "idle", text: "" });

  useEffect(() => {
    const root = scrollRootRef?.current || document.querySelector(".cardScroll");
    const section = sectionRef.current;
    if (!root || !section) return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.classList.add("is-inview");
        io.unobserve(entry.target);
      },
      { root, threshold: 0.35, rootMargin: "-5% 0px -20% 0px" }
    );

    io.observe(section);
    return () => io.disconnect();
  }, [scrollRootRef]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({ type: "error", text: "Please fill in all fields." });
      return;
    }

    setStatus({ type: "sending", text: "Sending..." });

    try {
      await submitContactForm(
        makeContactPayload(
          {
            name: form.name,
            email: form.email,
            message: form.message,
          },
          "home-contact"
        )
      );

      setForm({ name: "", email: "", message: "" });
      setStatus({
        type: "ok",
        text: "Message sent successfully. Check your email for the auto-reply.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <section className="contactSection sectionBlock" aria-label="Contact" ref={sectionRef}>
      <div className="contactShell">
        <div className="contactGlow" aria-hidden="true" />

        <div className="contactHead">
          <h2 className="contactTitle">Contact with me to sizzle your project</h2>
          <p className="contactSub">
            Feel free to contact me if you have any questions. I&apos;m available for
            projects or just for chatting.
          </p>
        </div>

        <form className="contactForm" onSubmit={onSubmit}>
          <div className="contactRow">
            <label className="field">
              <span className="srOnly">Name</span>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Name"
                autoComplete="name"
              />
            </label>

            <label className="field">
              <span className="srOnly">Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="Email"
                autoComplete="email"
              />
            </label>
          </div>

          <label className="field field--area">
            <span className="srOnly">Work Description</span>
            <textarea
              name="message"
              value={form.message}
              onChange={onChange}
              placeholder="Work Description..."
              rows={6}
            />
          </label>

          <button className="contactBtn" type="submit" disabled={status.type === "sending"}>
            {status.type === "sending" ? "Sending..." : "Submit"}
          </button>

          {status.type !== "idle" && (
            <p
              className={`contactStatus ${status.type === "ok" ? "isOk" : "isErr"}`}
              role="status"
            >
              {status.text}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
