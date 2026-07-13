import { CSSProperties, FormEvent, useMemo, useState } from "react";
import { getBirthdayReading, getPhoneReading, ReadingResult } from "./calculators";
import { countryCodes, offerings, processSteps, services } from "./content";

type ReadingKind = "phone" | "birthday";
type ClientReport = {
  id: string;
  kind: ReadingKind;
  title: string;
  message: string;
  normalizedInput?: string;
  createdAt: string;
  status: "full";
};

const reportsStorageKey = "aga-vilife-client-reports";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function readStoredReports(): Record<string, ClientReport[]> {
  try {
    const raw = window.localStorage.getItem(reportsStorageKey);
    return raw ? (JSON.parse(raw) as Record<string, ClientReport[]>) : {};
  } catch {
    return {};
  }
}

function getReportsForEmail(email: string) {
  return readStoredReports()[normalizeEmail(email)] ?? [];
}

function ResultPanel({ kind, result }: { kind: ReadingKind; result: ReadingResult | null }) {
  if (!result) {
    return <p className="result-empty">填写资料后，这里会显示你的完整测算结果。</p>;
  }

  if (!result.ok) {
    return (
      <div className="result-panel result-panel--error">
        <span className="result-title">{result.title}</span>
        <p>{result.message}</p>
      </div>
    );
  }

  const [reportType, ...reportLines] = result.message.split("\n");
  const conclusion = reportLines.find((line) => line.startsWith("完整结论"));
  const detailLines = reportLines.filter((line) => line !== conclusion);

  return (
    <div className="result-panel result-panel--success">
      <div className="result-report-header">
        <div>
          <span className="result-report-label">{kind === "phone" ? "号码报告" : "生日报告"}</span>
          <strong>{result.title}</strong>
        </div>
        <span className="result-badge">{kind === "phone" ? "号码完整结果" : "生日完整结果"}</span>
      </div>

      <span className="result-report-type">{reportType}</span>
      <div className="result-lines">
        {detailLines.map((line) => {
          const [label, ...valueParts] = line.split("：");
          const value = valueParts.join("：");

          return (
            <div className="result-line" key={line}>
              <span>{label}</span>
              <p>{value}</p>
            </div>
          );
        })}
      </div>

      {conclusion ? <p className="result-conclusion">{conclusion}</p> : null}
      {result.normalizedInput ? <small className="result-record">记录：{result.normalizedInput}</small> : null}
    </div>
  );
}

function PhoneBreakdown({ result }: { result: ReadingResult | null }) {
  if (!result?.ok || !result.breakdown?.length) {
    return null;
  }

  const [one, two, three, four, five, six, seven] = result.breakdown;
  const gridItems = [one, null, four, six, two, three, five, seven];

  return (
    <section className="phone-breakdown" aria-label="电话号码 7 个计算结果">
      <div className="phone-breakdown-heading">
        <span>7 个计算结果</span>
        <p>根据号码公式拆出的七个基础输出。</p>
      </div>
      <div className="phone-breakdown-grid">
        {gridItems.map((item, index) =>
          item ? (
            <div className="phone-breakdown-item" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
              <em className="bagua-symbol" aria-hidden="true">
                {item.symbol}
              </em>
            </div>
          ) : (
            <div className="phone-breakdown-empty" aria-hidden="true" key={`empty-${index}`} />
          )
        )}
      </div>

      {result.yearlyAnalysis?.length ? (
        <section className="time-analysis" aria-label="电话号码未来 12 年走势">
          <div className="time-analysis-heading">
            <span>未来 12 年走势</span>
            <p>从 2026 年开始，以年份干支五行对照号码体卦，判断当年助力、消耗与压力。</p>
          </div>
          <div className="year-analysis-grid">
            {result.yearlyAnalysis.map((item) => (
              <article className={`time-card time-card--${item.tone}`} key={item.label}>
                <div>
                  <span>{item.label}</span>
                  <strong>{item.ganzhi}</strong>
                </div>
                <small>{item.element}</small>
                <p>{item.summary}</p>
                <em>{item.tone}</em>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {result.monthlyAnalysis?.length ? (
        <section className="time-analysis" aria-label="电话号码 2026 年月度五行细看">
          <div className="time-analysis-heading">
            <span>2026 月度五行细看</span>
            <p>按节气月的地支五行近似到公历月份，帮助你看每个月的号码能量变化。</p>
          </div>
          <div className="month-analysis-grid">
            {result.monthlyAnalysis.map((item) => (
              <article className={`time-card time-card--compact time-card--${item.tone}`} key={item.label}>
                <div>
                  <span>{item.label}</span>
                  <strong>{item.ganzhi}</strong>
                </div>
                <small>{item.element}</small>
                <p>{item.summary}</p>
                <em>{item.tone}</em>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function ClientPortal() {
  const [loginEmail, setLoginEmail] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const reports = clientEmail ? getReportsForEmail(clientEmail) : [];

  function submitClientLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidEmail(loginEmail)) {
      setLoginError("请输入有效的电子邮箱。");
      return;
    }

    setClientEmail(normalizeEmail(loginEmail));
    setLoginError("");
  }

  return (
    <main className="client-page">
      <nav className="nav client-nav" aria-label="客户中心导航">
        <a className="brand" href="/" aria-label="aga-vilife 首页">
          aga-vilife
        </a>
        <div className="nav-links">
          <a href="/">网站</a>
          <a href="/client">客户中心</a>
        </div>
      </nav>

      <section className="client-shell">
        <div className="client-intro">
          <h1>客户中心</h1>
          <p>使用你留下的邮箱登录，查看已解锁的一半结果与完整报告购买入口。</p>
        </div>

        {!clientEmail ? (
          <form className="client-login-card" noValidate onSubmit={submitClientLogin}>
            <label htmlFor="client-email">登录邮箱</label>
            <input
              id="client-email"
              inputMode="email"
              placeholder="you@example.com"
              type="email"
              value={loginEmail}
              onChange={(event) => {
                setLoginEmail(event.target.value);
                setLoginError("");
              }}
            />
            {loginError ? <p className="form-error">{loginError}</p> : null}
            <button className="button button-primary" type="submit">
              进入客户中心
            </button>
          </form>
        ) : (
          <section className="client-dashboard">
            <div className="client-dashboard-header">
              <div>
                <span>登录邮箱</span>
                <strong>{clientEmail}</strong>
              </div>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => {
                  setClientEmail("");
                  setLoginEmail("");
                }}
              >
                切换邮箱
              </button>
            </div>

            <h2>我的报告</h2>
            {reports.length ? (
              <div className="client-report-list">
                {reports.map((report) => (
                  <article className="client-report-card" key={report.id}>
                    <div>
                      <span>{report.kind === "phone" ? "手机号码" : "生日命理"}</span>
                      <h3>{report.title}</h3>
                    </div>
                    <p>{report.message}</p>
                    {report.normalizedInput ? <strong>{report.normalizedInput}</strong> : null}
                    <a className="button button-report" href="mailto:hello@aga-vilife.com?subject=购买完整报告">
                      购买完整报告
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <div className="client-empty">
                <h3>还没有报告</h3>
                <p>回到网站完成一次号码或生日测算，并留下同一个邮箱后，报告会出现在这里。</p>
                <a className="button button-primary" href="/#tools">
                  去测算
                </a>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

function SiteNav({ current }: { current?: "home" | "phone" | "birthday" | "client" }) {
  return (
    <nav className="nav" aria-label="主导航">
      <a className="brand" href="/" aria-label="aga-vilife 首页">
        aga-vilife
      </a>
      <div className="nav-links">
        <a aria-current={current === "home" ? "page" : undefined} href="/">
          首页
        </a>
        <a aria-current={current === "phone" ? "page" : undefined} href="/phone">
          手机号码
        </a>
        <a aria-current={current === "birthday" ? "page" : undefined} href="/birthday">
          生日命理
        </a>
        <a aria-current={current === "client" ? "page" : undefined} href="/client">
          客户中心
        </a>
        <a href="/#contact">联系</a>
      </div>
    </nav>
  );
}

function PageHeading({
  current,
  eyebrow,
  title,
  description,
  activeTab
}: {
  current: "phone" | "birthday" | "client";
  eyebrow: string;
  title: string;
  description: string;
  activeTab: string;
}) {
  return (
    <header className="tool-page-header">
      <SiteNav current={current} />
      <div className="tool-title-row">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="soft-tabs" aria-label={`${title}功能分区`}>
        {[activeTab, "能量解读", "改善建议"].map((tab, index) => (
          <span className={index === 0 ? "is-active" : ""} key={tab}>
            {tab}
          </span>
        ))}
      </div>
    </header>
  );
}

function CompassPlate({ tone = "light" }: { tone?: "light" | "dark" }) {
  const directions = ["午", "未", "申", "酉", "戌", "亥", "子", "丑", "寅", "卯", "辰", "巳"];

  return (
    <div className={`compass-plate compass-plate--${tone}`} aria-hidden="true">
      <div className="compass-outer">
        {directions.map((item, index) => (
          <span style={{ "--turn": `${index * 30}deg` } as CSSProperties} key={item}>
            {item}
          </span>
        ))}
        <div className="compass-inner">
          <strong>坎</strong>
          <small>186° 南</small>
        </div>
      </div>
    </div>
  );
}

function PhoneToolPage() {
  const [countryCode, setCountryCode] = useState(countryCodes[0].value);
  const [phone, setPhone] = useState("");
  const [phoneResult, setPhoneResult] = useState<ReadingResult | null>(null);
  const selectedCountry = countryCodes.find((option) => option.value === countryCode) ?? countryCodes[0];

  function submitPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = getPhoneReading(countryCode, phone);
    setPhoneResult(result);
  }

  return (
    <main className="tool-page">
      <PageHeading
        current="phone"
        eyebrow="01 · 号码罗盘"
        title="手机号码测算"
        description="输入正在使用或考虑选择的号码，系统会整理成完整的梅花易数号码结果。"
        activeTab="综合盘"
      />
      <section className="tool-page-shell">
        <div className="tool-side-panel">
          <CompassPlate />
          <div className="mini-stat-grid" aria-label="号码测算摘要">
            <span>
              方位
              <strong>南</strong>
            </span>
            <span>
              八卦
              <strong>离</strong>
            </span>
            <span>
              九星
              <strong>九紫</strong>
            </span>
          </div>
        </div>

        <article className="tool-card tool-card--full">
          <form onSubmit={submitPhone}>
            <label htmlFor="phone">手机号码</label>
            <div className="phone-input-row">
              <select
                aria-label="国家区号"
                value={countryCode}
                onChange={(event) => setCountryCode(event.target.value)}
              >
                {countryCodes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value} {option.label}
                  </option>
                ))}
              </select>
              <input
                id="phone"
                inputMode="tel"
                placeholder={selectedCountry.hint}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <p className="field-hint">{selectedCountry.label}号码格式：{selectedCountry.hint}</p>
            <button className="button button-primary" type="submit">
              查看完整结果
            </button>
          </form>
          <ResultPanel kind="phone" result={phoneResult} />
          <PhoneBreakdown result={phoneResult} />
        </article>
      </section>
    </main>
  );
}

function BirthdayToolPage() {
  const [birthday, setBirthday] = useState("");
  const [birthdayResult, setBirthdayResult] = useState<ReadingResult | null>(null);

  function submitBirthday(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const submittedBirthday = String(formData.get("birthday") ?? birthday);
    const result = getBirthdayReading(submittedBirthday);
    setBirthday(submittedBirthday);
    setBirthdayResult(result);
  }

  return (
    <main className="tool-page">
      <PageHeading
        current="birthday"
        eyebrow="02 · 八字分析"
        title="生日命理分析"
        description="选择出生日期，系统会生成生命灵数金字塔、辅助三角与流年核心的完整结果。"
        activeTab="宅命分析"
      />
      <section className="tool-page-shell">
        <div className="tool-side-panel">
          <div className="score-panel">
            <span>整体评分</span>
            <strong>85分</strong>
            <p>吉宅气场良好，布局合理，宜继续保持。</p>
          </div>
          <div className="direction-grid" aria-label="方位吉凶参考">
            {["正北 伏位 吉", "东北 五鬼 凶", "正东 天医 吉", "正南 生气 吉", "西南 祸害 凶", "西北 延年 吉"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <article className="tool-card tool-card--full">
          <form onSubmit={submitBirthday}>
            <label htmlFor="birthday">出生日期</label>
            <input
              id="birthday"
              name="birthday"
              type="date"
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
            />
            <button className="button button-primary" type="submit">
              查看完整结果
            </button>
          </form>
          <ResultPanel kind="birthday" result={birthdayResult} />
        </article>
      </section>
    </main>
  );
}

function HomePage() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const dateTiles = ["嫁娶", "开市", "交易", "求财", "祈福", "出行", "入宅", "安床"];

  return (
    <main>
      <section className="hero" id="home">
        <SiteNav current="home" />

        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">东方命理 · 数字能量 · 生活风水</span>
            <h1>
              从号码与生日，
              <span>看见生活里的气场流向</span>
            </h1>
            <p>
              aga-vilife 以风水与数字能量为入口，帮助你整理手机号码、生日信息与日常选择之间的关系。
            </p>
            <div className="hero-actions" aria-label="主要操作">
              <a className="button button-primary" href="/phone">
                手机号码测算
              </a>
              <a className="button button-secondary" href="/birthday">
                生日命理分析
              </a>
            </div>
          </div>

          <div className="reference-stage" aria-label="风水应用视觉参考">
            <img src="/assets/reference-home-calendar.png" alt="黄历择日与风水分析界面参考" />
            <div className="floating-result">
              <span>今日宜忌</span>
              <strong>宜</strong>
              <p>祈福、求财、出行、纳财</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section intro-section" id="services">
        <div>
          <h2>不需要注册，先看方向</h2>
          <p>
            我们先把体验做轻：你可以直接输入资料，感受服务流程。真实测算公式会在确认后接入，适合之后扩展为更完整的个人报告。
          </p>
        </div>
        <div className="service-list">
          {services.map((service) => (
            <article className="service-card" key={service.title}>
              <span>{service.marker}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section compass-section" aria-label="风水罗盘体验">
        <div className="dark-oracle">
          <CompassPlate tone="dark" />
          <div className="oracle-caption">
            <span>坐北朝南 · 正向</span>
            <strong>当前方位：186° 南</strong>
          </div>
        </div>
        <div className="calendar-card">
          <span className="eyebrow">黄历择日</span>
          <h2>把吉日、方位与数字放在同一个判断里</h2>
          <div className="date-grid">
            {dateTiles.map((tile, index) => (
              <span className={index < 4 ? "is-good" : ""} key={tile}>
                {tile}
              </span>
            ))}
          </div>
          <p>参考吉日页面的紧凑信息结构，让用户快速扫描适合做什么、避免什么，以及下一步该看哪一项报告。</p>
        </div>
      </section>

      <section className="section tools-section" id="tools">
        <div className="section-heading">
          <h2>两项核心测算</h2>
          <p>从首页选择方向后，进入独立页面输入资料并查看完整结果。</p>
        </div>

        <div className="tool-grid">
          <article className="tool-card" id="phone-tool">
            <div>
              <span className="tool-index">01</span>
              <h3>手机号码测算</h3>
              <p>整理号码、本卦、互卦、变卦、动爻与六亲关系。</p>
            </div>
            <a className="button button-primary" href="/phone">
              开始测算
            </a>
          </article>

          <article className="tool-card" id="birthday-tool">
            <div>
              <span className="tool-index">02</span>
              <h3>生日命理分析</h3>
              <p>生成生命灵数金字塔、辅助三角、本命核心与流年核心。</p>
            </div>
            <a className="button button-primary" href="/birthday">
              开始分析
            </a>
          </article>
        </div>
      </section>

      <section className="section consult-section">
        <div className="consult-copy">
          <h2>把测算变成可执行的生活建议</h2>
          <p>
            当你的正式公式准备好后，这里可以扩展成完整报告、预约咨询或付费服务。现在先展示 aga-vilife 的服务范围。
          </p>
        </div>
        <div className="offering-panel">
          {offerings.map((offering) => (
            <div className="offering-row" key={offering}>
              <span aria-hidden="true" />
              <p>{offering}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section reference-gallery" aria-label="视觉风格参考">
        <img src="/assets/reference-fengshui-panels.png" alt="空间风水、五行能量分析和吉物推荐界面参考" />
        <img src="/assets/reference-luopan-calendar.png" alt="风水罗盘、八宅分析和择日吉日界面参考" />
        <img src="/assets/reference-hexagram-oracle.png" alt="六爻占卦与卦象界面参考" />
      </section>

      <section className="section process-section">
        <h2>服务流程</h2>
        <div className="process-track">
          {processSteps.map((step, index) => (
            <div className="process-step" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <h2>想接入正式公式？</h2>
        <p>把你的手机号码风水规则与生日命理规则交给我们，下一步就能变成完整线上测算。</p>
        <a className="button button-primary" href="mailto:hello@aga-vilife.com">
          联系 aga-vilife
        </a>
      </section>

      <footer>
        <span>aga-vilife</span>
        <p>© {year} 风水能量测算服务</p>
      </footer>

    </main>
  );
}

export default function App() {
  const pathname = window.location.pathname;

  if (pathname === "/client") {
    return <ClientPortal />;
  }

  if (pathname === "/phone") {
    return <PhoneToolPage />;
  }

  if (pathname === "/birthday") {
    return <BirthdayToolPage />;
  }

  return <HomePage />;
}
