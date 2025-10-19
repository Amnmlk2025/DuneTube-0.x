import React, { useEffect, useMemo, useState } from "react";

const BRAND = { deepBlue: "#0A355C", sand: "#E8DCC8" };

type PlanId = "free" | "standard" | "pro";

type Course = {
  id: number;
  title: string;
  teacher?: string;
  organization?: string;
  thumbnail?: string;
  base_price: number; // USD
  currency?: "USD";
};

const mockCourse: Course = {
  id: 1,
  title: "Mastering Prompt Engineering",
  teacher: "Dr. Sara AI",
  organization: "Future Minds Academy",
  base_price: 49, // قیمت پایه؛ می‌تونی صفر کنی تا رایگان شود
  currency: "USD",
};

const Icon = {
  Hamburger: () => (
    <svg viewBox="0 0 24 24" width="22" height="22">
      <path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
    </svg>
  ),
  Logo: () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="4" fill="currentColor" />
      <polygon points="10,9 16,12 10,15" fill="white" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path
        fill="currentColor"
        d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-1.06 1.06l.27.28v.79L20 19.5 19.5 20l-3.99-4zM10.5 14A3.5 3.5 0 1114 10.5 3.5 3.5 0 0110.5 14z"
      />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path
        fill="currentColor"
        d="M12 12a5 5 0 100-10 5 5 0 000 10Zm0 2c-4.4 0-8 2.24-8 5v1h16v-1c0-2.76-3.6-5-8-5Z"
      />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path fill="currentColor" d="M9 16.17l-3.5-3.5L4 14.17l5 5 11-11-1.41-1.41z" />
    </svg>
  ),
};

export default function Checkout() {
  // header/UX
  const [panelOpen, setPanelOpen] = useState(false);
  const [lang, setLang] = useState<"FA" | "EN">("EN");
  const [isAuth, setIsAuth] = useState(true);
  const [search, setSearch] = useState("");

  const [panelW, setPanelW] = useState(window.innerWidth < 1400 ? 300 : 360);
  useEffect(() => {
    const onResize = () => setPanelW(window.innerWidth < 1400 ? 300 : 360);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // data
  const [course, setCourse] = useState<Course | null>(null);
  useEffect(() => {
    setCourse(mockCourse);
  }, []);

  // form state
  const [plan, setPlan] = useState<PlanId>("standard");
  const [coupon, setCoupon] = useState("");
  const [payment, setPayment] = useState<"card" | "paypal" | "cod">("card");

  // pricing
  const planMultiplier: Record<PlanId, number> = {
    free: 0,
    standard: 1,
    pro: 1.8,
  };

  const priceRaw = useMemo(() => {
    if (!course) return 0;
    return Math.round(course.base_price * planMultiplier[plan]);
  }, [course, plan]);

  const couponDiscount = useMemo(() => {
    const c = coupon.trim().toUpperCase();
    if (!c) return 0;
    // نمونه قوانین تخفیف
    if (c === "FREE100") return priceRaw; // رایگان کامل
    if (c === "OFF20") return Math.round(priceRaw * 0.2);
    if (c === "STUDENT10") return Math.round(priceRaw * 0.1);
    return 0;
  }, [coupon, priceRaw]);

  const subtotal = Math.max(0, priceRaw - couponDiscount);
  const taxRate = 0.09; // 9% نمونه
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal === 0 ? 0 : subtotal + tax;

  const paddingLeftWhenOpen = panelOpen ? panelW : 0;

  // submit mock
  const [submitted, setSubmitted] = useState<null | "success" | "free">(
    null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // اگر رایگان شده:
    if (total === 0) {
      setSubmitted("free");
      // شبیه‌سازی: هدایت به صفحه دوره
      setTimeout(() => {
        window.location.href = `/course/${course?.id}`;
      }, 800);
      return;
    }
    // پرداخت ماک
    setSubmitted("success");
    setTimeout(() => {
      window.location.href = `/course/${course?.id}`;
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="max-w-screen-xl w-full mx-auto h-16 flex items-center gap-3 px-3 sm:px-6">
          <button
            onClick={() => setPanelOpen((v) => !v)}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Menu"
          >
            <Icon.Hamburger />
          </button>

          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
            style={{ background: BRAND.deepBlue }}
            aria-label="Dunetube"
          >
            <Icon.Logo />
          </div>
          <span
            className="hidden sm:block font-semibold text-[clamp(1rem,1.6vw,1.125rem)]"
            style={{ color: BRAND.deepBlue }}
          >
            Dunetube
          </span>

          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border text-[clamp(.9rem,1.2vw,1rem)]"
                placeholder={
                  lang === "FA" ? "جست‌وجوی دوره…" : "Search courses…"
                }
              />
              <span className="absolute left-3 top-2.5 text-gray-500">
                <Icon.Search />
              </span>
            </div>
          </div>

          <button
            onClick={() => setLang((l) => (l === "EN" ? "FA" : "EN"))}
            className="px-3 py-2 rounded border text-sm"
            title="Toggle language"
          >
            {lang}
          </button>

          <button
            onClick={() => setIsAuth((v) => !v)}
            className="p-2 rounded hover:bg-gray-100"
            title={isAuth ? "Profile" : "Login"}
          >
            <Icon.User />
          </button>
        </div>
      </header>

      {/* ===== SETTINGS PANEL ===== */}
      {panelOpen && (
        <aside
          className="fixed left-0 top-16 bottom-0 z-40 border-r bg-white overflow-y-auto"
          style={{ width: panelW }}
          aria-label="Settings panel"
        >
          <div className="p-4 text-sm text-gray-700 space-y-6">
            <div
              className="font-semibold mb-2"
              style={{ color: BRAND.deepBlue }}
            >
              Settings
            </div>
            <div className="space-y-2">
              <div className="font-medium">Theme</div>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded border">Light</button>
                <button className="px-3 py-2 rounded border">Dark</button>
                <button className="px-3 py-2 rounded border">System</button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="font-medium">Language</div>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded border">FA</button>
                <button className="px-3 py-2 rounded border">EN</button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="font-medium">Account</div>
              {isAuth ? (
                <div className="rounded border p-3">
                  Signed in • Profile & Security
                </div>
              ) : (
                <button
                  className="px-3 py-2 rounded-lg text-white"
                  style={{ background: BRAND.deepBlue }}
                >
                  {lang === "FA" ? "ورود / ثبت‌نام" : "Sign in / Sign up"}
                </button>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* ===== CONTENT ===== */}
      <div className="pt-[80px]" style={{ paddingLeft: paddingLeftWhenOpen }}>
        <main className="max-w-screen-xl w-full mx-auto px-3 sm:px-5 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
            {/* LEFT: form */}
            <section className="space-y-6">
              <div className="rounded-xl border bg-white p-4">
                <div
                  className="text-[clamp(1.05rem,1.8vw,1.25rem)] font-semibold mb-1"
                  style={{ color: BRAND.deepBlue }}
                >
                  {lang === "FA" ? "ثبت‌نام در دوره" : "Enroll in course"}
                </div>
                <div className="text-sm text-gray-600">
                  {course?.organization} • {course?.teacher}
                </div>
                <div className="text-[clamp(1rem,1.6vw,1.15rem)] font-medium mt-2">
                  {course?.title}
                </div>
              </div>

              {/* Plans */}
              <div className="rounded-xl border bg-white p-4">
                <div className="font-semibold mb-3">
                  {lang === "FA" ? "انتخاب پلن" : "Choose a plan"}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: "free", name: lang === "FA" ? "آزمون رایگان" : "Audit (Free)", desc: lang === "FA" ? "فقط مشاهده محدود" : "Limited access" },
                    { id: "standard", name: lang === "FA" ? "استاندارد" : "Standard", desc: lang === "FA" ? "دسترسی کامل + تکالیف" : "Full access + assignments" },
                    { id: "pro", name: lang === "FA" ? "پرو" : "Pro", desc: lang === "FA" ? "همه‌چیز + مشاوره" : "Everything + mentoring" },
                  ].map((p) => (
                    <label key={p.id} className={`rounded-lg border p-3 cursor-pointer ${plan === (p.id as PlanId) ? "border-blue-500 ring-1 ring-blue-200" : "hover:border-gray-400"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.desc}</div>
                        </div>
                        <input
                          type="radio"
                          name="plan"
                          value={p.id}
                          checked={plan === (p.id as PlanId)}
                          onChange={() => setPlan(p.id as PlanId)}
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment method */}
              <div className="rounded-xl border bg-white p-4">
                <div className="font-semibold mb-3">
                  {lang === "FA" ? "روش پرداخت" : "Payment method"}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {[
                    { id: "card", label: lang === "FA" ? "کارت بانکی" : "Credit/Debit card" },
                    { id: "paypal", label: "PayPal" },
                    { id: "cod", label: lang === "FA" ? "پرداخت آفلاین" : "Offline / Wire" },
                  ].map((m) => (
                    <label key={m.id} className={`rounded-lg border px-3 py-2 cursor-pointer ${payment === m.id ? "border-blue-500 ring-1 ring-blue-200" : "hover:border-gray-400"}`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment"
                          value={m.id}
                          checked={payment === (m.id as any)}
                          onChange={() => setPayment(m.id as any)}
                        />
                        <span>{m.label}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* fake card fields */}
                {payment === "card" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <input className="border rounded-lg px-3 py-2" placeholder={lang === "FA" ? "شماره کارت" : "Card number"} />
                    <input className="border rounded-lg px-3 py-2" placeholder={lang === "FA" ? "نام روی کارت" : "Name on card"} />
                    <input className="border rounded-lg px-3 py-2" placeholder="MM/YY" />
                    <input className="border rounded-lg px-3 py-2" placeholder="CVC" />
                  </div>
                )}
              </div>

              {/* Coupon */}
              <div className="rounded-xl border bg-white p-4">
                <div className="font-semibold mb-3">{lang === "FA" ? "کد تخفیف" : "Discount code"}</div>
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="border rounded-lg px-3 py-2 flex-1"
                    placeholder={lang === "FA" ? "مثلاً OFF20 یا FREE100" : "e.g., OFF20 or FREE100"}
                  />
                  <button
                    className="px-4 py-2 rounded-lg border"
                    onClick={() => setCoupon(coupon.trim())}
                  >
                    {lang === "FA" ? "اعمال" : "Apply"}
                  </button>
                </div>
                {coupon && couponDiscount === 0 && (
                  <div className="text-sm text-red-600 mt-2">
                    {lang === "FA" ? "کد معتبر نیست." : "Invalid code."}
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="text-sm text-green-700 mt-2 inline-flex items-center gap-1">
                    <Icon.Check /> {lang === "FA" ? "تخفیف اعمال شد" : "Discount applied"}
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">
                {lang === "FA"
                  ? "با ادامه، با شرایط استفاده و سیاست بازگشت وجه موافق هستید."
                  : "By continuing, you agree to the Terms of Use and Refund Policy."}
              </div>
            </section>

            {/* RIGHT: sticky summary */}
            <aside className="lg:sticky lg:top-[88px] h-max">
              <div className="rounded-xl border bg-white p-4 w-full min-w-[260px]">
                <div className="font-semibold mb-2" style={{ color: BRAND.deepBlue }}>
                  {lang === "FA" ? "خلاصه سفارش" : "Order summary"}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-20 h-14 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                    {/* thumb mock */}
                    <svg width="32" height="32" viewBox="0 0 24 24" className="opacity-60">
                      <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium line-clamp-2">{course?.title}</div>
                    <div className="text-xs text-gray-600">
                      {course?.organization} • {course?.teacher}
                    </div>
                  </div>
                </div>

                <div className="divide-y text-sm">
                  <div className="py-2 flex justify-between">
                    <span>{lang === "FA" ? "قیمت پلن" : "Plan price"}</span>
                    <span>${priceRaw.toFixed(0)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>{lang === "FA" ? "تخفیف" : "Discount"}</span>
                    <span>- ${couponDiscount.toFixed(0)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>{lang === "FA" ? "جمع جزء" : "Subtotal"}</span>
                    <span>${subtotal.toFixed(0)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>{lang === "FA" ? "مالیات" : "Tax"}</span>
                    <span>${tax.toFixed(0)}</span>
                  </div>
                  <div className="py-2 flex justify-between font-semibold">
                    <span>{lang === "FA" ? "مبلغ نهایی" : "Total"}</span>
                    <span>{total === 0 ? (lang === "FA" ? "رایگان" : "Free") : `$${total.toFixed(0)}`}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-4">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 rounded-lg text-white font-medium"
                    style={{ background: BRAND.deepBlue }}
                  >
                    {total === 0
                      ? lang === "FA"
                        ? "ثبت‌نام رایگان"
                        : "Enroll for Free"
                      : lang === "FA"
                      ? "تکمیل پرداخت"
                      : "Complete Payment"}
                  </button>

                  {submitted === "success" && (
                    <div className="text-green-700 text-sm mt-2">
                      {lang === "FA" ? "پرداخت انجام شد؛ هدایت به صفحه دوره…" : "Payment successful; redirecting to course…"}
                    </div>
                  )}
                  {submitted === "free" && (
                    <div className="text-green-700 text-sm mt-2">
                      {lang === "FA" ? "ثبت‌نام انجام شد؛ هدایت به صفحه دوره…" : "Enrolled; redirecting to course…"}
                    </div>
                  )}
                </form>

                <div className="text-[12px] text-gray-500 mt-3">
                  {lang === "FA"
                    ? "پرداخت امن با رمزنگاری انجام می‌شود."
                    : "Secure payment with encryption."}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
