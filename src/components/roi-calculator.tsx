"use client";

import { useState, useMemo, useRef, useEffect, type ReactNode } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#FC6200",
  "#68DDDC",
  "#FFA622",
  "#DADB5F",
  "#AD44A9",
  "#730071",
  "#00273B",
];

export const fmt = (n: number | null, d = 0) =>
  n == null
    ? "—"
    : n.toLocaleString("en-US", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      });
export const fmtDollar = (n: number | null, d = 0) =>
  n == null ? "—" : "$" + fmt(n, d);
export const fmtPct = (n: number | null, d = 2) =>
  n == null ? "—" : (n * 100).toFixed(d) + "%";

function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState("right");
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos(window.innerWidth - rect.right < 260 ? "left" : "right");
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <span
      ref={ref}
      className="relative inline-flex items-center ml-1.5 align-middle"
      style={{ verticalAlign: "middle" }}
    >
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="w-4 h-4 rounded-full bg-[#003350] hover:bg-[#FC6200] text-white flex items-center justify-center transition-colors flex-shrink-0"
        style={{ fontSize: "10px", lineHeight: 1 }}
        tabIndex={0}
        aria-label="More info"
      >
        i
      </button>
      {open && (
        <div
          className={`absolute z-50 w-60 bg-[#00273B] border border-[#FC6200]/60 rounded-xl shadow-2xl px-3 py-2.5 text-xs text-gray-200 leading-relaxed pointer-events-none
          ${pos === "right" ? "left-6 top-1/2 -translate-y-1/2" : "right-6 top-1/2 -translate-y-1/2"}`}
          style={{ minWidth: "220px" }}
        >
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-[#00273B] border-[#FC6200]/60 rotate-45 ${pos === "right" ? "-left-1 border-b border-l" : "-right-1 border-t border-r"}`}
          />
          {text}
        </div>
      )}
    </span>
  );
}

function Field({
  label,
  hint,
  tip,
  children,
}: {
  label: string;
  hint?: string;
  tip?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-300 flex items-center flex-wrap gap-x-1">
        <span>{label}</span>
        {hint && <span className="text-gray-500 font-normal">({hint})</span>}
        {tip && <InfoTip text={tip} />}
      </label>
      {children}
    </div>
  );
}

function Section({
  title,
  subtitle,
  badge,
  children,
  cols,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
  cols?: number;
}) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#FC6200] uppercase tracking-widest">
              {title}
            </h3>
            {badge && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge === "Card" ? "bg-[#FC6200]/20 text-[#FC6200] border border-[#FC6200]/40" : "bg-[#68DDDC]/20 text-[#68DDDC] border border-[#68DDDC]/40"}`}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div
        className={`grid grid-cols-1 gap-3 ${cols === 2 ? "md:grid-cols-2 lg:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"}`}
      >
        {children}
      </div>
    </div>
  );
}

const inp =
  "bg-[#003350] border border-[#00273B]/60 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FC6200] w-full";

function KPI({
  label,
  value,
  sub,
  accent,
  teal,
  tip,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  teal?: boolean;
  tip?: string;
}) {
  return (
    <div
      className={`rounded-xl p-4 border ${accent ? "border-[#FC6200] bg-[#FC6200]/10" : teal ? "border-[#68DDDC] bg-[#68DDDC]/10" : "border-[#003350] bg-[#003350]/60"}`}
    >
      <div className="text-xs text-gray-400 mb-1 flex items-center">
        {label}
        {tip && <InfoTip text={tip} />}
      </div>
      <div
        className={`text-xl font-bold ${accent ? "text-[#FC6200]" : teal ? "text-[#68DDDC]" : "text-white"}`}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function Diff({
  label,
  current,
  cresora,
  isCurrency = true,
  lowerBetter = true,
  tip,
  tag,
}: {
  label: string;
  current: number;
  cresora: number;
  isCurrency?: boolean;
  lowerBetter?: boolean;
  tip?: string;
  tag?: string;
}) {
  const delta = cresora - current;
  const pct = current !== 0 ? (delta / Math.abs(current)) * 100 : 0;
  const good = lowerBetter ? delta < 0 : delta > 0;
  const fmtVal = (v: number) =>
    isCurrency ? fmtDollar(v, 0) : fmtPct(v / 100, 2);
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#003350]/60 text-xs sm:text-sm gap-2">
      <span className="text-gray-300 min-w-[120px] sm:w-48 flex items-center gap-1 shrink-0">
        {tag && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${tag === "Card" ? "bg-[#FC6200]/20 text-[#FC6200]" : "bg-[#68DDDC]/20 text-[#68DDDC]"}`}
          >
            {tag}
          </span>
        )}
        {label}
        {tip && <InfoTip text={tip} />}
      </span>
      <span className="text-gray-400 w-20 sm:w-28 text-right shrink-0">{fmtVal(current)}</span>
      <span className="text-white w-20 sm:w-28 text-right font-medium shrink-0">
        {fmtVal(cresora)}
      </span>
      <span
        className={`w-24 sm:w-28 text-right font-semibold shrink-0 ${good ? "text-emerald-400" : "text-red-400"}`}
      >
        {delta > 0 ? "+" : ""}
        {isCurrency ? fmtDollar(delta, 0) : fmtPct(delta / 100, 2)} (
        {pct > 0 ? "+" : ""}
        {pct.toFixed(1)}%)
      </span>
    </div>
  );
}

const T = {
  merchants:
    "The total number of merchants currently processing under your ISV platform. This is the base multiplier for all portfolio-level cost and savings calculations.",
  avgVol:
    "The average card payment volume each merchant processes per month. This drives your interchange and markup costs.",
  avgTxn:
    "How many individual card transactions the average merchant runs per month. Higher counts amplify per-transaction fee impact.",
  achVol:
    "Average monthly ACH (bank-to-bank) transfer volume per merchant. ACH is priced very differently from cards — typically a flat per-transaction fee rather than a percentage — making it highly cost-effective for large ticket sizes like B2B invoices, rent, insurance, or utilities.",
  achTxn:
    "Average number of ACH transactions per merchant per month. Unlike cards, ACH costs are dominated by per-item fees, not volume percentage — so transaction count is the key cost driver.",
  achFee:
    "The flat fee your current processor charges per ACH debit or credit transaction. Industry range is $0.20–$1.00 per item. This applies to every transaction regardless of dollar amount.",
  achReturn:
    "The percentage of ACH transactions that are returned (NSF, invalid account, unauthorized, etc.). Industry average is 1–3%. ACH returns are more expensive to handle than card declines because they involve manual intervention and a separate return fee.",
  achReturnFee:
    "The fee charged per ACH return event. Typically $2–$5 per return from your processor, plus potential fees passed on to the merchant. High return rates in ACH can quickly erode the cost advantage of ACH over cards.",
  avgTicket:
    "The average dollar value of a single card transaction. Affects auth rate loss calculations, chargeback exposure, and per-item fee weight.",
  cpPct:
    "Card Present (CP) means physically swiped/dipped/tapped — lower interchange. Card Not Present (CNP) is e-commerce or keyed — higher interchange due to fraud risk.",
  authRate:
    "% of card transactions successfully approved. A 92% rate means 8% of attempts are declined — lost revenue. Cresora's multi-rail routing retries declines through alternate processors to recover 1–3% of those.",
  pricingModel:
    "How your processor charges for card transactions. IC+ is most transparent. Flat-Rate is simple but costly for low-interchange cards. Tiered hides true costs in qualification buckets.",
  markup:
    "Basis points above actual interchange (set by Visa/Mastercard). Reducing this is the fastest lever on effective rate.",
  perTxn:
    "Flat fee per card transaction regardless of amount. At scale across thousands of merchants, this becomes a significant line item.",
  flatRate:
    "All-inclusive rate on every card transaction. Merchants with debit-heavy or CP-heavy volume are likely overpaying.",
  tieredQual:
    "Lowest tier — standard consumer cards swiped in person. Processors design tiers so fewer transactions qualify here than advertised.",
  tieredMidQual:
    "Middle tier — rewards cards, business cards, or manually keyed entries. Usually 0.5–1% above qualified.",
  tieredNonQual:
    "Highest tier — premium rewards, corporate cards, or unqualified transactions. Can be 1.5–2% above qualified.",
  gateway:
    "Monthly gateway fee per merchant to route/process card transactions. Cresora's embedded orchestration eliminates the need for a standalone gateway.",
  pci:
    "Annual PCI DSS compliance cost per merchant. Cresora's hosted tokenization reduces merchant PCI scope by ~60%.",
  api:
    "Monthly spend on third-party API integrations and middleware for your current processor(s).",
  devHrs:
    "Internal engineering hours monthly to maintain payment integrations, handle processor updates, and manage downtime.",
  laborRate:
    "Internal cost per hour for tech/ops staff — used to value dev hours and chargeback labor.",
  cbRate:
    "% of card transactions resulting in a chargeback. Above 1% triggers Visa/Mastercard monitoring programs.",
  cbFee:
    "Processor fee per chargeback regardless of win/loss. Typically $15–$35.",
  cbLabor:
    "Internal hours spent per dispute on evidence, documentation, and response. Often 1.5–3 hrs each.",
  returnRate:
    "% of card transactions refunded/returned. Fees are rarely refunded by processors.",
  returnFee:
    "Some processors charge a small fee to process refunds. Common in certain verticals.",
  fundingDays:
    "Business days for settled funds to reach merchant bank accounts. Slower funding = more working capital tied up.",
  costOfCapital:
    "Annualized cost of money. 1 extra day of float on $85K/mo volume costs ~$14/day per merchant at 6% cost of capital.",
  onboard:
    "Total cost per new merchant to underwrite, verify, and board — KYB, risk review, setup, and support.",
  churn:
    "Annual % of merchants who leave. Each lost merchant represents forfeited LTV.",
  ltv:
    "Total net revenue generated by an average merchant over their full relationship with your platform.",
  revShare:
    "% of net residuals returned to the ISV. Common splits: 20–50%. Cresora's model increases this as a partnership lever.",
  contractLen:
    "Length of your current processor agreement. Many auto-renew with 30–90 day cancellation windows.",
  termFee:
    "Exit fee if you leave before contract end. Often a flat amount or remaining monthly minimums.",
  exclusivity:
    "Whether your contract forces all volume through a single processor. Exclusivity blocks multi-rail routing — one of Cresora's core authorization rate levers.",
  authLift:
    "Revenue recovered from declined card transactions via Cresora's intelligent multi-processor routing. If one processor declines, Cresora retries through an alternate rail automatically.",
  cbReduction:
    "Estimated reduction in chargeback frequency via Cresora's fraud scoring, velocity checks, and 3DS2 orchestration.",
  cresoraFunding:
    "Cresora targets next-business-day funding vs. the 2–3 day industry norm. Faster funding improves merchant cash flow.",
  churnReduction:
    "Estimated merchant retention improvement from better payment performance, higher approval rates, and faster funding.",
  cresoraRevShare:
    "Rev share % Cresora offers ISV partners. Enter from your Cresora proposal or use the default estimate.",
  effectiveRate:
    "The true all-in cost of payment acceptance as a % of total volume — including all fees, PCI, chargebacks, and gateway costs. The single most honest comparison metric.",
  residualPool:
    "Estimated at ~50bps of total portfolio volume — a conservative estimate of net revenue above interchange and costs available for ISV rev share.",
  cresoraAchFee:
    "Cresora's ACH per-transaction fee. Typically $0.10–$0.25 vs. $0.25–$0.75 at traditional processors — a significant margin improvement for ACH-heavy merchants.",
  totalVolume:
    "Combined card + ACH monthly volume across your entire portfolio. The blended effective rate is calculated across this total.",
  totalTxn:
    "Combined card + ACH transaction count. Used to weight the blended cost-per-transaction across both payment rails.",
};

export default function ROICalculator() {
  const [tab, setTab] = useState("isv");

  // Card inputs
  const [merchants, setMerchants] = useState(500);
  const [avgMonthlyVol, setAvgMonthlyVol] = useState(85000);
  const [avgMonthlyTxn, setAvgMonthlyTxn] = useState(1200);
  const [avgTicket, setAvgTicket] = useState(71);
  const [pricingModel, setPricingModel] = useState("ic_plus");
  const [cpPct, setCpPct] = useState(55);
  const [currentMarkupPct, setCurrentMarkupPct] = useState(0.4);
  const [currentPerTxn, setCurrentPerTxn] = useState(0.1);
  const [flatRate, setFlatRate] = useState(2.7);
  const [tieredQual, setTieredQual] = useState(1.79);
  const [tieredMidQual, setTieredMidQual] = useState(2.49);
  const [tieredNonQual, setTieredNonQual] = useState(3.49);
  const [tieredQualPct, setTieredQualPct] = useState(55);
  const [tieredMidQualPct, setTieredMidQualPct] = useState(30);

  // ACH inputs
  const [achMonthlyVol, setAchMonthlyVol] = useState(22000);
  const [achMonthlyTxn, setAchMonthlyTxn] = useState(85);
  const [achPerTxnFee, setAchPerTxnFee] = useState(0.5);
  const [achReturnRate, setAchReturnRate] = useState(1.8);
  const [achReturnFee, setAchReturnFee] = useState(3.0);

  // Platform costs
  const [gatewayFeeMonthly, setGatewayFeeMonthly] = useState(25);
  const [pciFeeAnnual, setPciFeeAnnual] = useState(1200);
  const [authRate, setAuthRate] = useState(92);
  const [cbRate, setCbRate] = useState(0.45);
  const [cbFee, setCbFee] = useState(25);
  const [returnRate, setReturnRate] = useState(1.2);
  const [avgReturnFee, setAvgReturnFee] = useState(0.5);
  const [cbLaborHrs, setCbLaborHrs] = useState(2);
  const [laborRate, setLaborRate] = useState(35);
  const [fundingDays, setFundingDays] = useState(2);
  const [costOfCapital, setCostOfCapital] = useState(6);
  const [apiCostMonthly, setApiCostMonthly] = useState(1500);
  const [devHrsMonthly, setDevHrsMonthly] = useState(20);
  const [contractLength, setContractLength] = useState(3);
  const [termFee, setTermFee] = useState(5000);
  const [hasExclusivity, setHasExclusivity] = useState("yes");
  const [revenueSharePct, setRevenueSharePct] = useState(25);
  const [onboardCostPerMerch, setOnboardCostPerMerch] = useState(120);
  const [merchantChurnRate, setMerchantChurnRate] = useState(8);
  const [avgMerchantLTV, setAvgMerchantLTV] = useState(4200);

  // Cresora assumptions
  const [cresoraMarkupPct, setCresoraMarkupPct] = useState(0.2);
  const [cresoraPerTxn, setCresoraPerTxn] = useState(0.07);
  const [cresoraFlatRate, setCresoraFlatRate] = useState(2.45);
  const [cresoraAchPerTxn, setCresoraAchPerTxn] = useState(0.18);
  const [cresoraAuthRateLift, setCresoraAuthRateLift] = useState(2.5);
  const [cresoraRevSharePct, setCresoraRevSharePct] = useState(40);
  const [cresoraCbReduction, setCresoraCbReduction] = useState(20);
  const [cresoraFundingDays, setCresoraFundingDays] = useState(1);
  const [cresoraOnboardCost, setCresoraOnboardCost] = useState(45);
  const [cresoraChurnReduction, setCresoraChurnReduction] = useState(30);
  const [cresoraApiCost, setCresoraApiCost] = useState(0);
  const [cresoraDevHrs, setCresoraDevHrs] = useState(4);

  // Suppress unused variable warnings for contract fields used only in display
  void contractLength;

  const IC_CP = 1.51,
    IC_CNP = 1.8;
  const blendedIC = IC_CP * (cpPct / 100) + IC_CNP * ((100 - cpPct) / 100);

  const calc = useMemo(() => {
    const annualCardVol = merchants * avgMonthlyVol * 12;
    const annualCardTxn = merchants * avgMonthlyTxn * 12;
    const annualAchVol = merchants * achMonthlyVol * 12;
    const annualAchTxn = merchants * achMonthlyTxn * 12;
    const annualTotalVol = annualCardVol + annualAchVol;
    const annualTotalTxn = annualCardTxn + annualAchTxn;

    let cardCostPct = 0,
      cresoraCardCostPct = 0;
    if (pricingModel === "ic_plus") {
      cardCostPct = blendedIC / 100 + currentMarkupPct / 100;
      cresoraCardCostPct = blendedIC / 100 + cresoraMarkupPct / 100;
    } else if (pricingModel === "flat") {
      cardCostPct = flatRate / 100;
      cresoraCardCostPct = cresoraFlatRate / 100;
    } else {
      const tNQ = Math.max(0, 100 - tieredQualPct - tieredMidQualPct) / 100;
      cardCostPct =
        (tieredQual / 100) * (tieredQualPct / 100) +
        (tieredMidQual / 100) * (tieredMidQualPct / 100) +
        (tieredNonQual / 100) * tNQ;
      cresoraCardCostPct = blendedIC / 100 + cresoraMarkupPct / 100;
    }

    const currentCardProcessing = annualCardVol * cardCostPct;
    const cresoraCardProcessing = annualCardVol * cresoraCardCostPct;
    const currentCardPerTxn = annualCardTxn * currentPerTxn;
    const cresoraCardPerTxn = annualCardTxn * cresoraPerTxn;

    const achReturnsPerYear = annualAchTxn * (achReturnRate / 100);
    const currentAchCost =
      annualAchTxn * achPerTxnFee + achReturnsPerYear * achReturnFee;
    const cresoraAchCost =
      annualAchTxn * cresoraAchPerTxn +
      achReturnsPerYear * achReturnFee * 0.7;

    const currentGatewayCost = merchants * gatewayFeeMonthly * 12;
    const currentPCICost = merchants * pciFeeAnnual;
    const cresoraPCICost = merchants * pciFeeAnnual * 0.4;

    const cresoraAuthRate = Math.min(99, authRate + cresoraAuthRateLift);
    const authLiftRevenue =
      annualCardTxn * ((cresoraAuthRate - authRate) / 100) * avgTicket;

    const cbsPerYear = annualCardTxn * (cbRate / 100);
    const currentCbCost = cbsPerYear * cbFee + cbsPerYear * cbLaborHrs * laborRate;
    const cresoraCbCost = currentCbCost * (1 - cresoraCbReduction / 100);

    const currentReturnCost =
      annualCardTxn * (returnRate / 100) * avgReturnFee;
    const cresoraReturnCost = currentReturnCost * 0.85;

    const fundingValue =
      (annualTotalVol / 365) *
      (fundingDays - cresoraFundingDays) *
      (costOfCapital / 100);

    const currentApiAnnual =
      apiCostMonthly * 12 + devHrsMonthly * 12 * laborRate;
    const cresoraApiAnnual =
      cresoraApiCost * 12 + cresoraDevHrs * 12 * laborRate;

    const currentOnboardAnnual = merchants * 0.2 * onboardCostPerMerch;
    const cresoraOnboardAnnual = merchants * 0.2 * cresoraOnboardCost;

    const currentChurnLoss =
      merchants * (merchantChurnRate / 100) * avgMerchantLTV;
    const churnSavings = currentChurnLoss * (cresoraChurnReduction / 100);

    const grossResidualPool = annualTotalVol * 0.005;
    const currentResidual = grossResidualPool * (revenueSharePct / 100);
    const cresoraResidual = grossResidualPool * (cresoraRevSharePct / 100);
    const residualDelta = cresoraResidual - currentResidual;

    const currentTotalFees =
      currentCardProcessing +
      currentCardPerTxn +
      currentAchCost +
      currentGatewayCost +
      currentPCICost +
      currentCbCost +
      currentReturnCost +
      currentApiAnnual;
    const cresoraTotalFees =
      cresoraCardProcessing +
      cresoraCardPerTxn +
      cresoraAchCost +
      0 +
      cresoraPCICost +
      cresoraCbCost +
      cresoraReturnCost +
      cresoraApiAnnual;
    const currentEffectiveRate = currentTotalFees / annualTotalVol;
    const cresoraEffectiveRate = cresoraTotalFees / annualTotalVol;

    const totalSavings =
      currentTotalFees -
      cresoraTotalFees +
      authLiftRevenue +
      fundingValue +
      (currentOnboardAnnual - cresoraOnboardAnnual) +
      churnSavings;
    const totalWithResidual = totalSavings + residualDelta;

    return {
      annualCardVol,
      annualCardTxn,
      annualAchVol,
      annualAchTxn,
      annualTotalVol,
      annualTotalTxn,
      currentCardProcessing,
      cresoraCardProcessing,
      currentCardPerTxn,
      cresoraCardPerTxn,
      currentAchCost,
      cresoraAchCost,
      currentGatewayCost,
      cresoraGatewayCost: 0,
      currentPCICost,
      cresoraPCICost,
      currentCbCost,
      cresoraCbCost,
      currentReturnCost,
      cresoraReturnCost,
      currentApiAnnual,
      cresoraApiAnnual,
      currentOnboardAnnual,
      cresoraOnboardAnnual,
      churnSavings,
      authLiftRevenue,
      fundingValue,
      currentEffectiveRate,
      cresoraEffectiveRate,
      currentResidual,
      cresoraResidual,
      residualDelta,
      grossResidualPool,
      totalSavings,
      totalWithResidual,
      achReturnsPerYear,
      cardCostPct,
      cresoraCardCostPct,
    };
  }, [
    merchants, avgMonthlyVol, avgMonthlyTxn, avgTicket, pricingModel, cpPct,
    currentMarkupPct, currentPerTxn, flatRate, tieredQual, tieredMidQual,
    tieredNonQual, tieredQualPct, tieredMidQualPct, achMonthlyVol,
    achMonthlyTxn, achPerTxnFee, achReturnRate, achReturnFee,
    gatewayFeeMonthly, pciFeeAnnual, authRate, cbRate, cbFee, returnRate,
    avgReturnFee, cbLaborHrs, laborRate, fundingDays, costOfCapital,
    apiCostMonthly, devHrsMonthly, revenueSharePct, onboardCostPerMerch,
    merchantChurnRate, avgMerchantLTV, cresoraMarkupPct, cresoraPerTxn,
    cresoraFlatRate, cresoraAchPerTxn, cresoraAuthRateLift, cresoraRevSharePct,
    cresoraCbReduction, cresoraFundingDays, cresoraOnboardCost,
    cresoraChurnReduction, cresoraApiCost, cresoraDevHrs, blendedIC,
  ]);

  const merchantCalc = useMemo(() => {
    const cardVol = avgMonthlyVol * 12,
      cardTxn = avgMonthlyTxn * 12;
    const achVol = achMonthlyVol * 12,
      achTxn = achMonthlyTxn * 12;
    const totalVol = cardVol + achVol,
      totalTxn = cardTxn + achTxn;
    let cp = 0,
      crp = 0;
    if (pricingModel === "ic_plus") {
      cp = blendedIC / 100 + currentMarkupPct / 100;
      crp = blendedIC / 100 + cresoraMarkupPct / 100;
    } else if (pricingModel === "flat") {
      cp = flatRate / 100;
      crp = cresoraFlatRate / 100;
    } else {
      const tNQ = Math.max(0, 100 - tieredQualPct - tieredMidQualPct) / 100;
      cp =
        (tieredQual / 100) * (tieredQualPct / 100) +
        (tieredMidQual / 100) * (tieredMidQualPct / 100) +
        (tieredNonQual / 100) * tNQ;
      crp = blendedIC / 100 + cresoraMarkupPct / 100;
    }

    const currentCardFees =
      cardVol * cp +
      cardTxn * currentPerTxn +
      gatewayFeeMonthly * 12 +
      pciFeeAnnual +
      cardTxn * (cbRate / 100) * cbFee;
    const currentAchFees =
      achTxn * achPerTxnFee + achTxn * (achReturnRate / 100) * achReturnFee;
    const currentFees = currentCardFees + currentAchFees;

    const cresoraCardFees =
      cardVol * crp +
      cardTxn * cresoraPerTxn +
      pciFeeAnnual * 0.4 +
      cardTxn * (cbRate / 100) * cbFee * (1 - cresoraCbReduction / 100);
    const cresoraAchFees =
      achTxn * cresoraAchPerTxn +
      achTxn * (achReturnRate / 100) * achReturnFee * 0.7;
    const cresoraFees = cresoraCardFees + cresoraAchFees;

    const authLift = cardTxn * (cresoraAuthRateLift / 100) * avgTicket;
    const funding =
      (totalVol / 365) *
      (fundingDays - cresoraFundingDays) *
      (costOfCapital / 100);
    const savings = currentFees - cresoraFees + authLift + funding;
    return {
      cardVol,
      achVol,
      totalVol,
      cardTxn,
      achTxn,
      totalTxn,
      currentFees,
      cresoraFees,
      currentAchFees,
      cresoraAchFees,
      authLift,
      funding,
      savings,
      savingsPct: savings / currentFees,
      currentCardFees,
      cresoraCardFees,
      cp,
      crp,
    };
  }, [
    avgMonthlyVol, avgMonthlyTxn, achMonthlyVol, achMonthlyTxn, achPerTxnFee,
    achReturnRate, achReturnFee, pricingModel, blendedIC, currentMarkupPct,
    cresoraMarkupPct, flatRate, cresoraFlatRate, tieredQual, tieredMidQual,
    tieredNonQual, tieredQualPct, tieredMidQualPct, currentPerTxn,
    cresoraPerTxn, gatewayFeeMonthly, pciFeeAnnual, cbRate, cbFee,
    cresoraCbReduction, cresoraAchPerTxn, cresoraAuthRateLift, avgTicket,
    fundingDays, cresoraFundingDays, costOfCapital,
  ]);

  const savingsBreakdown = [
    { name: "Card Processing", current: calc.currentCardProcessing, cresora: calc.cresoraCardProcessing },
    { name: "Card Per-Txn", current: calc.currentCardPerTxn, cresora: calc.cresoraCardPerTxn },
    { name: "ACH", current: calc.currentAchCost, cresora: calc.cresoraAchCost },
    { name: "Gateway", current: calc.currentGatewayCost, cresora: 0 },
    { name: "PCI", current: calc.currentPCICost, cresora: calc.cresoraPCICost },
    { name: "Chargebacks", current: calc.currentCbCost, cresora: calc.cresoraCbCost },
    { name: "API/Dev", current: calc.currentApiAnnual, cresora: calc.cresoraApiAnnual },
  ];

  const pieData = [
    { name: "Card Processing", value: Math.max(0, calc.currentCardProcessing - calc.cresoraCardProcessing) },
    { name: "ACH Savings", value: Math.max(0, calc.currentAchCost - calc.cresoraAchCost) },
    { name: "Auth Rate Lift", value: Math.max(0, calc.authLiftRevenue) },
    { name: "Chargebacks", value: Math.max(0, calc.currentCbCost - calc.cresoraCbCost) },
    { name: "Gateway", value: Math.max(0, calc.currentGatewayCost) },
    { name: "Funding Speed", value: Math.max(0, calc.fundingValue) },
    { name: "Residual Uplift", value: Math.max(0, calc.residualDelta) },
  ].filter((d) => d.value > 0);

  const achVolPct =
    calc.annualTotalVol > 0
      ? ((calc.annualAchVol / calc.annualTotalVol) * 100).toFixed(1)
      : "0";
  const achTxnPct =
    calc.annualTotalTxn > 0
      ? ((calc.annualAchTxn / calc.annualTotalTxn) * 100).toFixed(1)
      : "0";

  return (
    <div className="text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-8 border-b border-[#003350] overflow-x-auto">
          {[
            { id: "isv", label: "ISV Portfolio Input" },
            { id: "summary", label: "ISV ROI Summary" },
            { id: "merchant", label: "Merchant-Level ROI" },
            { id: "assumptions", label: "Cresora Assumptions" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap ${
                tab === t.id
                  ? "border-[#FC6200] text-[#FC6200]"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ISV INPUT */}
        {tab === "isv" && (
          <div>
            <Section title="Portfolio Profile" subtitle="Your merchant portfolio overview">
              <Field label="Total Merchants in Portfolio" tip={T.merchants}>
                <input type="number" className={inp} value={merchants} onChange={(e) => setMerchants(+e.target.value)} />
              </Field>
            </Section>

            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <KPI label="Total Monthly Card Volume" value={fmtDollar(merchants * avgMonthlyVol)} sub="per month, portfolio" tip={T.avgVol} />
              <KPI label="Total Monthly Card Txns" value={fmt(merchants * avgMonthlyTxn)} sub="per month, portfolio" tip={T.avgTxn} />
              <KPI label="Total Monthly ACH Volume" value={fmtDollar(merchants * achMonthlyVol)} sub="per month, portfolio" teal tip={T.achVol} />
              <KPI label="Total Monthly ACH Txns" value={fmt(merchants * achMonthlyTxn)} sub="per month, portfolio" teal tip={T.achTxn} />
            </div>

            <Section title="Card Volume & Mix" badge="Card">
              <Field label="Avg Monthly Card Volume" hint="per merchant" tip={T.avgVol}>
                <input type="number" className={inp} value={avgMonthlyVol} onChange={(e) => setAvgMonthlyVol(+e.target.value)} />
              </Field>
              <Field label="Avg Monthly Card Transactions" hint="per merchant" tip={T.avgTxn}>
                <input type="number" className={inp} value={avgMonthlyTxn} onChange={(e) => setAvgMonthlyTxn(+e.target.value)} />
              </Field>
              <Field label="Average Ticket Amount" hint="$" tip={T.avgTicket}>
                <input type="number" className={inp} value={avgTicket} onChange={(e) => setAvgTicket(+e.target.value)} />
              </Field>
              <Field label="Card Present vs. Not Present Mix" tip={T.cpPct}>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={100} value={cpPct} onChange={(e) => setCpPct(+e.target.value)} className="flex-1 accent-[#FC6200]" />
                  <span className="text-sm text-[#FC6200] w-28 text-right whitespace-nowrap">CP {cpPct}% / CNP {100 - cpPct}%</span>
                </div>
              </Field>
              <Field label="Current Authorization Rate" hint="%" tip={T.authRate}>
                <input type="number" className={inp} value={authRate} onChange={(e) => setAuthRate(+e.target.value)} min={0} max={100} step={0.1} />
              </Field>
            </Section>

            <Section title="ACH Volume & Pricing" badge="ACH" subtitle="Bank-to-bank transfers — priced per item, not as a % of volume">
              <Field label="Avg Monthly ACH Volume" hint="per merchant" tip={T.achVol}>
                <input type="number" className={inp} value={achMonthlyVol} onChange={(e) => setAchMonthlyVol(+e.target.value)} />
              </Field>
              <Field label="Avg Monthly ACH Transactions" hint="per merchant" tip={T.achTxn}>
                <input type="number" className={inp} value={achMonthlyTxn} onChange={(e) => setAchMonthlyTxn(+e.target.value)} />
              </Field>
              <Field label="Current ACH Per-Transaction Fee" hint="$ per item" tip={T.achFee}>
                <input type="number" className={inp} value={achPerTxnFee} onChange={(e) => setAchPerTxnFee(+e.target.value)} step={0.01} />
              </Field>
              <Field label="ACH Return Rate" hint="% of ACH transactions" tip={T.achReturn}>
                <input type="number" className={inp} value={achReturnRate} onChange={(e) => setAchReturnRate(+e.target.value)} step={0.1} />
              </Field>
              <Field label="ACH Return Fee" hint="$ per return" tip={T.achReturnFee}>
                <input type="number" className={inp} value={achReturnFee} onChange={(e) => setAchReturnFee(+e.target.value)} step={0.25} />
              </Field>
            </Section>

            <Section title="Card Pricing Model" subtitle="Select your pricing structure and enter your rates" badge="Card">
              <Field label="Pricing Model" tip={T.pricingModel}>
                <select className={inp} value={pricingModel} onChange={(e) => setPricingModel(e.target.value)}>
                  <option value="ic_plus">Interchange-Plus (IC+)</option>
                  <option value="flat">Flat-Rate</option>
                  <option value="tiered">Tiered Pricing</option>
                </select>
              </Field>
              {pricingModel === "ic_plus" && (
                <>
                  <Field label="Current Markup over Interchange" hint="%" tip={T.markup}>
                    <input type="number" className={inp} value={currentMarkupPct} onChange={(e) => setCurrentMarkupPct(+e.target.value)} step={0.01} />
                  </Field>
                  <Field label="Per-Transaction Fee" hint="$" tip={T.perTxn}>
                    <input type="number" className={inp} value={currentPerTxn} onChange={(e) => setCurrentPerTxn(+e.target.value)} step={0.01} />
                  </Field>
                </>
              )}
              {pricingModel === "flat" && (
                <Field label="Flat Rate" hint="%" tip={T.flatRate}>
                  <input type="number" className={inp} value={flatRate} onChange={(e) => setFlatRate(+e.target.value)} step={0.01} />
                </Field>
              )}
              {pricingModel === "tiered" && (
                <>
                  <Field label="Qualified Rate" hint="%" tip={T.tieredQual}><input type="number" className={inp} value={tieredQual} onChange={(e) => setTieredQual(+e.target.value)} step={0.01} /></Field>
                  <Field label="Mid-Qualified Rate" hint="%" tip={T.tieredMidQual}><input type="number" className={inp} value={tieredMidQual} onChange={(e) => setTieredMidQual(+e.target.value)} step={0.01} /></Field>
                  <Field label="Non-Qualified Rate" hint="%" tip={T.tieredNonQual}><input type="number" className={inp} value={tieredNonQual} onChange={(e) => setTieredNonQual(+e.target.value)} step={0.01} /></Field>
                  <Field label="% of Txns — Qualified"><input type="number" className={inp} value={tieredQualPct} onChange={(e) => setTieredQualPct(+e.target.value)} /></Field>
                  <Field label="% of Txns — Mid-Qualified"><input type="number" className={inp} value={tieredMidQualPct} onChange={(e) => setTieredMidQualPct(+e.target.value)} /></Field>
                </>
              )}
            </Section>

            <Section title="Platform & Compliance Costs">
              <Field label="Monthly Gateway Fee" hint="$ per merchant" tip={T.gateway}><input type="number" className={inp} value={gatewayFeeMonthly} onChange={(e) => setGatewayFeeMonthly(+e.target.value)} /></Field>
              <Field label="Annual PCI Compliance Fee" hint="$ per merchant" tip={T.pci}><input type="number" className={inp} value={pciFeeAnnual} onChange={(e) => setPciFeeAnnual(+e.target.value)} /></Field>
              <Field label="API / Integration Cost" hint="$/month total" tip={T.api}><input type="number" className={inp} value={apiCostMonthly} onChange={(e) => setApiCostMonthly(+e.target.value)} /></Field>
              <Field label="Dev / Maintenance Hours" hint="hrs/month" tip={T.devHrs}><input type="number" className={inp} value={devHrsMonthly} onChange={(e) => setDevHrsMonthly(+e.target.value)} /></Field>
              <Field label="Internal Labor Rate" hint="$/hr" tip={T.laborRate}><input type="number" className={inp} value={laborRate} onChange={(e) => setLaborRate(+e.target.value)} /></Field>
            </Section>

            <Section title="Card Disputes & Returns" badge="Card" subtitle="Leave defaults if unknown">
              <Field label="Chargeback Rate" hint="% of card txns" tip={T.cbRate}><input type="number" className={inp} value={cbRate} onChange={(e) => setCbRate(+e.target.value)} step={0.01} /></Field>
              <Field label="Chargeback Fee" hint="$ per dispute" tip={T.cbFee}><input type="number" className={inp} value={cbFee} onChange={(e) => setCbFee(+e.target.value)} /></Field>
              <Field label="Labor per Dispute" hint="hours" tip={T.cbLabor}><input type="number" className={inp} value={cbLaborHrs} onChange={(e) => setCbLaborHrs(+e.target.value)} step={0.5} /></Field>
              <Field label="Card Return / Refund Rate" hint="% of card txns" tip={T.returnRate}><input type="number" className={inp} value={returnRate} onChange={(e) => setReturnRate(+e.target.value)} step={0.1} /></Field>
              <Field label="Avg Card Return Fee" hint="$" tip={T.returnFee}><input type="number" className={inp} value={avgReturnFee} onChange={(e) => setAvgReturnFee(+e.target.value)} step={0.05} /></Field>
            </Section>

            <Section title="Cash Flow & Funding">
              <Field label="Current Funding Speed" hint="business days" tip={T.fundingDays}><input type="number" className={inp} value={fundingDays} onChange={(e) => setFundingDays(+e.target.value)} min={1} max={7} /></Field>
              <Field label="Cost of Capital" hint="% annually" tip={T.costOfCapital}><input type="number" className={inp} value={costOfCapital} onChange={(e) => setCostOfCapital(+e.target.value)} step={0.5} /></Field>
            </Section>

            <Section title="Merchant Lifecycle">
              <Field label="Onboarding Cost per New Merchant" hint="$" tip={T.onboard}><input type="number" className={inp} value={onboardCostPerMerch} onChange={(e) => setOnboardCostPerMerch(+e.target.value)} /></Field>
              <Field label="Annual Merchant Churn Rate" hint="%" tip={T.churn}><input type="number" className={inp} value={merchantChurnRate} onChange={(e) => setMerchantChurnRate(+e.target.value)} step={0.5} /></Field>
              <Field label="Average Merchant LTV" hint="$" tip={T.ltv}><input type="number" className={inp} value={avgMerchantLTV} onChange={(e) => setAvgMerchantLTV(+e.target.value)} /></Field>
            </Section>

            <Section title="Revenue Share & Contract Terms">
              <Field label="Current Rev Share to ISV" hint="% of residuals" tip={T.revShare}><input type="number" className={inp} value={revenueSharePct} onChange={(e) => setRevenueSharePct(+e.target.value)} min={0} max={100} /></Field>
              <Field label="Contract Length" hint="years" tip={T.contractLen}><input type="number" className={inp} value={contractLength} onChange={(e) => setContractLength(+e.target.value)} min={1} max={10} /></Field>
              <Field label="Early Termination Fee" hint="$" tip={T.termFee}><input type="number" className={inp} value={termFee} onChange={(e) => setTermFee(+e.target.value)} /></Field>
              <Field label="Exclusivity Clause" tip={T.exclusivity}>
                <select className={inp} value={hasExclusivity} onChange={(e) => setHasExclusivity(e.target.value)}>
                  <option value="yes">Yes — locked to single processor</option>
                  <option value="partial">Partial — preferred processor required</option>
                  <option value="no">No — free to route</option>
                </select>
              </Field>
            </Section>

            <div className="mt-4">
              <button onClick={() => setTab("summary")} className="bg-[#FC6200] hover:bg-[#FC6200] text-white font-semibold px-8 py-3 rounded-xl transition-all">
                View ROI Summary →
              </button>
            </div>
          </div>
        )}

        {/* SUMMARY TAB */}
        {tab === "summary" && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <KPI label="Total Annual Card Volume" value={fmtDollar(calc.annualCardVol)} sub={`${fmt(calc.annualCardTxn)} txns/yr`} />
              <KPI label="Total Annual ACH Volume" value={fmtDollar(calc.annualAchVol)} sub={`${fmt(calc.annualAchTxn)} txns/yr`} teal />
              <KPI label="Combined Annual Volume" value={fmtDollar(calc.annualTotalVol)} sub={`ACH is ${achVolPct}% of volume`} tip={T.totalVolume} />
              <KPI label="Combined Annual Transactions" value={fmt(calc.annualTotalTxn)} sub={`ACH is ${achTxnPct}% of txns`} tip={T.totalTxn} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-8">
              <KPI label="Total Annual Savings" value={fmtDollar(calc.totalSavings)} sub="fees + auth lift + ops" accent />
              <KPI label="Total w/ Residual Uplift" value={fmtDollar(calc.totalWithResidual)} sub="including rev share gain" accent />
            </div>

            {/* Effective Rate */}
            <div className="bg-[#003350]/60 border border-[#003350] rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-[#FC6200] uppercase tracking-widest mb-1 flex items-center">
                Blended Effective Rate — Card + ACH Combined <InfoTip text={T.effectiveRate} />
              </h3>
              <p className="text-xs text-gray-400 mb-4">Calculated across total portfolio volume ({fmtDollar(calc.annualTotalVol)}/yr)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center bg-[#00273B] rounded-xl p-4 border border-[#003350]">
                  <div className="text-xs text-gray-400 mb-1">Current Effective Rate</div>
                  <div className="text-3xl font-bold text-white">{fmtPct(calc.currentEffectiveRate)}</div>
                  <div className="text-xs text-gray-500 mt-1">all-in on total volume</div>
                </div>
                <div className="text-center bg-[#FC6200]/15 rounded-xl p-4 border border-[#FC6200]">
                  <div className="text-xs text-[#FC6200] mb-1">Cresora Effective Rate</div>
                  <div className="text-3xl font-bold text-[#FC6200]">{fmtPct(calc.cresoraEffectiveRate)}</div>
                  <div className="text-xs text-[#FC6200]/70 mt-1">projected all-in</div>
                </div>
                <div className="text-center bg-emerald-900/30 rounded-xl p-4 border border-emerald-700">
                  <div className="text-xs text-emerald-300 mb-1">Rate Reduction</div>
                  <div className="text-3xl font-bold text-emerald-400">{fmtPct(calc.currentEffectiveRate - calc.cresoraEffectiveRate)}</div>
                  <div className="text-xs text-emerald-400/70 mt-1">{fmt((calc.currentEffectiveRate - calc.cresoraEffectiveRate) * 10000, 0)} basis points saved</div>
                </div>
              </div>
            </div>

            {/* Rev Share */}
            <div className="bg-[#003350]/60 border border-[#003350] rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-[#FC6200] uppercase tracking-widest mb-4">Revenue Share / Residual Analysis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <KPI label="Residual Pool (Est.)" value={fmtDollar(calc.grossResidualPool)} sub="~50bps of total volume" tip={T.residualPool} />
                <KPI label="Current ISV Share" value={fmtDollar(calc.currentResidual)} sub={`${revenueSharePct}% split`} />
                <KPI label="Cresora ISV Share" value={fmtDollar(calc.cresoraResidual)} sub={`${cresoraRevSharePct}% split`} accent />
                <KPI label="Annual Residual Uplift" value={fmtDollar(calc.residualDelta)} sub="additional ISV revenue" accent />
              </div>
              <div className="text-xs text-gray-400 bg-[#00273B]/60 rounded-lg p-3 border border-[#003350]">
                <strong className="text-yellow-400">Contract Note:</strong>{" "}
                {hasExclusivity === "yes"
                  ? "Exclusivity clause restricts multi-processor routing — a core Cresora value driver for authorization rate lift."
                  : hasExclusivity === "partial"
                    ? "Preferred-processor requirement limits routing optimization. Cresora can work within or replace this."
                    : "No exclusivity — ideal for Cresora's multi-rail routing from day one."}
                {termFee > 0 && ` ETF of ${fmtDollar(termFee)} recovered in ~${Math.ceil(termFee / (calc.totalSavings / 12))} months of savings.`}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-[#003350]/60 border border-[#003350] rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-[#FC6200] uppercase tracking-widest mb-3">Annual Cost Breakdown — Current vs. Cresora</h3>
              <div className="overflow-x-auto -mx-5 px-5">
                <div className="min-w-[560px]">
                  <div className="flex items-center justify-between py-2 border-b border-[#003350] mb-1 text-xs font-semibold text-gray-400">
                    <span className="w-48">Cost Category</span>
                    <span className="w-28 text-right">Current</span>
                    <span className="w-28 text-right">Cresora</span>
                    <span className="w-28 text-right">Delta</span>
                  </div>
                  <Diff tag="Card" label="Processing Fees" current={calc.currentCardProcessing} cresora={calc.cresoraCardProcessing} tip="Annual interchange + markup cost on card volume across the full portfolio." />
                  <Diff tag="Card" label="Per-Txn Fees" current={calc.currentCardPerTxn} cresora={calc.cresoraCardPerTxn} tip="Flat per-transaction fees on all card transactions." />
                  <Diff tag="ACH" label="ACH Fees + Returns" current={calc.currentAchCost} cresora={calc.cresoraAchCost} tip="Combined ACH per-item fees and return/NSF fees." />
                  <Diff tag="Card" label="Gateway Fees" current={calc.currentGatewayCost} cresora={0} tip="Monthly gateway fees per merchant, eliminated by Cresora's embedded orchestration layer." />
                  <Diff label="PCI Compliance" current={calc.currentPCICost} cresora={calc.cresoraPCICost} tip="Annual PCI DSS compliance costs. Reduced ~60% via hosted tokenization." />
                  <Diff tag="Card" label="Chargebacks (fees+labor)" current={calc.currentCbCost} cresora={calc.cresoraCbCost} tip="Card dispute fees plus internal labor." />
                  <Diff tag="Card" label="Card Returns" current={calc.currentReturnCost} cresora={calc.cresoraReturnCost} tip="Annual card refund/return processing fees." />
                  <Diff label="API / Dev Costs" current={calc.currentApiAnnual} cresora={calc.cresoraApiAnnual} tip="API licensing + internal engineering labor." />
                  <Diff label="Onboarding Costs" current={calc.currentOnboardAnnual} cresora={calc.cresoraOnboardAnnual} tip="Annual merchant onboarding costs." />
                  <div className="mt-3 pt-3 border-t border-[#FC6200]/40 space-y-1">
                    {[
                      { label: "Card Auth Rate Lift", val: calc.authLiftRevenue, tip: T.authLift },
                      { label: "Funding Speed Value", val: calc.fundingValue, tip: "Working capital value from faster settlement on combined card + ACH volume." },
                      { label: "Merchant Retention (LTV)", val: calc.churnSavings, tip: "LTV preserved by reducing merchant churn." },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between text-sm font-bold">
                        <span className="w-48 text-white flex items-center">{r.label}<InfoTip text={r.tip} /></span>
                        <span className="w-28 text-right text-gray-400">—</span>
                        <span className="w-28 text-right text-emerald-400">+{fmtDollar(r.val)}</span>
                        <span className="w-28 text-right text-emerald-400">+{fmtDollar(r.val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#003350]/60 border border-[#003350] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-[#FC6200] uppercase tracking-widest mb-4">Cost Comparison by Category</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={savingsBreakdown} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#9ca3af" }} />
                    <YAxis tickFormatter={(v) => "$" + fmt(v / 1000) + "k"} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <Tooltip formatter={(v) => fmtDollar(v as number)} contentStyle={{ background: "#00273B", border: "1px solid #003350", borderRadius: "8px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="current" name="Current" fill="#FC6200" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cresora" name="Cresora" fill="#68DDDC" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-[#003350]/60 border border-[#003350] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-[#FC6200] uppercase tracking-widest mb-4">Where Savings Come From</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                      label={({ name, percent }) => `${String(name ?? "").split(" ")[0]} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmtDollar(v as number)} contentStyle={{ background: "#00273B", border: "1px solid #003350", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#00273B]/60 to-[#003350]/60 border border-[#FC6200]/50 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-[#FC6200] uppercase tracking-widest mb-4">ROI Snapshot</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <KPI label="Monthly Savings" value={fmtDollar(calc.totalSavings / 12)} sub="hard cost reduction" />
                <KPI label="Annual Total ROI" value={fmtDollar(calc.totalWithResidual)} sub="savings + residual uplift" accent />
                <KPI label="ETF Payback Period" value={termFee > 0 ? `${Math.ceil(termFee / (calc.totalSavings / 12))} mo` : "N/A"} sub="months to recover exit fee" />
                <KPI label="3-Year Net Value" value={fmtDollar(calc.totalWithResidual * 3 - termFee)} sub="net of termination fee" accent />
              </div>
            </div>
          </div>
        )}

        {/* MERCHANT TAB */}
        {tab === "merchant" && (
          <div>
            <div className="bg-[#FC6200]/10 border border-[#FC6200]/30 rounded-xl p-4 mb-6 text-sm text-[#FC6200]/80">
              Single merchant profile: <strong>{fmtDollar(avgMonthlyVol)}/mo card</strong> · <strong>{fmt(avgMonthlyTxn)} card txns/mo</strong> · <strong className="text-[#68DDDC]">{fmtDollar(achMonthlyVol)}/mo ACH</strong> · <strong className="text-[#68DDDC]">{fmt(achMonthlyTxn)} ACH txns/mo</strong>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <KPI label="Annual Card Volume" value={fmtDollar(merchantCalc.cardVol)} />
              <KPI label="Annual ACH Volume" value={fmtDollar(merchantCalc.achVol)} teal />
              <KPI label="Current Annual Fees (All-in)" value={fmtDollar(merchantCalc.currentFees)} />
              <KPI label="Cresora Annual Fees" value={fmtDollar(merchantCalc.cresoraFees)} accent />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#003350]/60 border border-[#FC6200]/40/40 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FC6200]/20 text-[#FC6200] border border-[#FC6200]/40">Card</span>
                  <h3 className="text-sm font-semibold text-white">Card Processing Fees</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-[#003350]/40">
                    <span className="text-gray-300">Current Annual Card Fees</span>
                    <span className="text-white font-medium">{fmtDollar(merchantCalc.currentCardFees)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#003350]/40">
                    <span className="text-gray-300">Cresora Annual Card Fees</span>
                    <span className="text-[#FC6200] font-medium">{fmtDollar(merchantCalc.cresoraCardFees)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-300">Card Savings</span>
                    <span className="text-emerald-400 font-bold">{fmtDollar(merchantCalc.currentCardFees - merchantCalc.cresoraCardFees)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#003350]/60 border border-[#68DDDC]/40/40 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#68DDDC]/20 text-[#68DDDC] border border-[#68DDDC]/40">ACH</span>
                  <h3 className="text-sm font-semibold text-white">ACH Processing Fees</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-[#003350]/40">
                    <span className="text-gray-300">Current Annual ACH Fees</span>
                    <span className="text-white font-medium">{fmtDollar(merchantCalc.currentAchFees)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#003350]/40">
                    <span className="text-gray-300">Cresora Annual ACH Fees</span>
                    <span className="text-[#68DDDC] font-medium">{fmtDollar(merchantCalc.cresoraAchFees)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-300">ACH Savings</span>
                    <span className="text-emerald-400 font-bold">{fmtDollar(merchantCalc.currentAchFees - merchantCalc.cresoraAchFees)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#003350]/60 border border-[#003350] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-[#FC6200] uppercase tracking-widest mb-4">Total Annual Savings Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: "Card Fee Reduction", val: merchantCalc.currentCardFees - merchantCalc.cresoraCardFees, color: "text-[#FC6200]" },
                    { label: "ACH Fee Reduction", val: merchantCalc.currentAchFees - merchantCalc.cresoraAchFees, color: "text-[#68DDDC]" },
                    { label: "Auth Rate Lift (Card)", val: merchantCalc.authLift, color: "text-blue-400" },
                    { label: "Funding Speed Value", val: merchantCalc.funding, color: "text-yellow-400" },
                  ].map((r, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-[#003350]/60">
                      <span className="text-sm text-gray-300">{r.label}</span>
                      <span className={`text-sm font-semibold ${r.color}`}>{fmtDollar(r.val)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-white">Total Annual Savings</span>
                    <span className="text-lg font-bold text-emerald-400">{fmtDollar(merchantCalc.savings)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Savings as % of Current Fees</span>
                    <span className="text-sm font-semibold text-emerald-400">{fmtPct(merchantCalc.savingsPct)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#003350]/60 border border-[#003350] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-[#FC6200] uppercase tracking-widest mb-4 flex items-center">Blended Effective Rate<InfoTip text={T.effectiveRate} /></h3>
                <div className="flex flex-col gap-4 mt-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Current Rate (Card + ACH)</span><span>{fmtPct(merchantCalc.currentFees / merchantCalc.totalVol)}</span></div>
                    <div className="h-3 bg-red-900/50 rounded-full"><div className="h-3 bg-red-500 rounded-full" style={{ width: `${Math.min(100, merchantCalc.cp * 50)}%` }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Cresora Rate (Card + ACH)</span><span>{fmtPct(merchantCalc.cresoraFees / merchantCalc.totalVol)}</span></div>
                    <div className="h-3 bg-[#FC6200]/20 rounded-full"><div className="h-3 bg-[#FC6200] rounded-full" style={{ width: `${Math.min(100, merchantCalc.crp * 50)}%` }} /></div>
                  </div>
                  <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-lg p-3 text-center mt-2">
                    <div className="text-xs text-emerald-300">Merchant Keeps</div>
                    <div className="text-2xl font-bold text-emerald-400">{fmtDollar(merchantCalc.savings)}</div>
                    <div className="text-xs text-emerald-400/70">more per year across all payment rails</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#003350]/60 border border-[#003350] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-[#FC6200] uppercase tracking-widest mb-4 flex items-center">
                Portfolio Projection — Savings at Scale <InfoTip text="Cumulative annual savings if per-merchant improvements were applied across different portfolio sizes up to your full count." />
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[
                  { scale: "10", savings: merchantCalc.savings * 10 },
                  { scale: "50", savings: merchantCalc.savings * 50 },
                  { scale: "100", savings: merchantCalc.savings * 100 },
                  { scale: fmt(merchants), savings: merchantCalc.savings * merchants },
                ]} margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <XAxis dataKey="scale" tick={{ fontSize: 11, fill: "#9ca3af" }} label={{ value: "Merchants", position: "insideBottom", offset: -2, fontSize: 10, fill: "#6b7280" }} />
                  <YAxis tickFormatter={(v) => "$" + fmt(v / 1000) + "k"} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <Tooltip formatter={(v) => fmtDollar(v as number)} contentStyle={{ background: "#00273B", border: "1px solid #003350", borderRadius: "8px" }} />
                  <Bar dataKey="savings" name="Annual Savings" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-3 text-center">Based on average merchant profile across card + ACH rails.</p>
            </div>
          </div>
        )}

        {/* ASSUMPTIONS TAB */}
        {tab === "assumptions" && (
          <div>
            <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-4 mb-6 text-sm text-yellow-200">
              Adjust these to match your Cresora proposal or expected outcomes.
            </div>
            <Section title="Cresora Card Pricing" badge="Card">
              {pricingModel === "ic_plus" && (
                <>
                  <Field label="Cresora Markup over IC" hint="%"><input type="number" className={inp} value={cresoraMarkupPct} onChange={(e) => setCresoraMarkupPct(+e.target.value)} step={0.01} /></Field>
                  <Field label="Cresora Per-Txn Fee" hint="$"><input type="number" className={inp} value={cresoraPerTxn} onChange={(e) => setCresoraPerTxn(+e.target.value)} step={0.01} /></Field>
                </>
              )}
              {pricingModel === "flat" && (
                <Field label="Cresora Flat Rate" hint="%"><input type="number" className={inp} value={cresoraFlatRate} onChange={(e) => setCresoraFlatRate(+e.target.value)} step={0.01} /></Field>
              )}
              {pricingModel === "tiered" && (
                <Field label="Cresora Markup over IC" hint="% — converts to IC+"><input type="number" className={inp} value={cresoraMarkupPct} onChange={(e) => setCresoraMarkupPct(+e.target.value)} step={0.01} /></Field>
              )}
            </Section>
            <Section title="Cresora ACH Pricing" badge="ACH">
              <Field label="Cresora ACH Per-Transaction Fee" hint="$ per item" tip={T.cresoraAchFee}>
                <input type="number" className={inp} value={cresoraAchPerTxn} onChange={(e) => setCresoraAchPerTxn(+e.target.value)} step={0.01} />
              </Field>
            </Section>
            <Section title="Performance Improvements">
              <Field label="Card Auth Rate Lift" hint="percentage points" tip={T.authLift}><input type="number" className={inp} value={cresoraAuthRateLift} onChange={(e) => setCresoraAuthRateLift(+e.target.value)} step={0.1} /></Field>
              <Field label="Chargeback Reduction" hint="%" tip={T.cbReduction}><input type="number" className={inp} value={cresoraCbReduction} onChange={(e) => setCresoraCbReduction(+e.target.value)} /></Field>
              <Field label="Funding Speed" hint="business days" tip={T.cresoraFunding}><input type="number" className={inp} value={cresoraFundingDays} onChange={(e) => setCresoraFundingDays(+e.target.value)} min={1} max={5} /></Field>
              <Field label="Merchant Churn Reduction" hint="%" tip={T.churnReduction}><input type="number" className={inp} value={cresoraChurnReduction} onChange={(e) => setCresoraChurnReduction(+e.target.value)} /></Field>
              <Field label="Onboarding Cost per Merchant" hint="$ with Cresora"><input type="number" className={inp} value={cresoraOnboardCost} onChange={(e) => setCresoraOnboardCost(+e.target.value)} /></Field>
            </Section>
            <Section title="Revenue Share">
              <Field label="Cresora ISV Rev Share" hint="% to ISV" tip={T.cresoraRevShare}><input type="number" className={inp} value={cresoraRevSharePct} onChange={(e) => setCresoraRevSharePct(+e.target.value)} min={0} max={100} /></Field>
            </Section>
            <Section title="Tech & Integration">
              <Field label="Cresora API Cost" hint="$/month"><input type="number" className={inp} value={cresoraApiCost} onChange={(e) => setCresoraApiCost(+e.target.value)} /></Field>
              <Field label="Dev / Maintenance Hours" hint="hrs/month w/ Cresora"><input type="number" className={inp} value={cresoraDevHrs} onChange={(e) => setCresoraDevHrs(+e.target.value)} /></Field>
            </Section>
            <div className="mt-4">
              <button onClick={() => setTab("summary")} className="bg-[#FC6200] hover:bg-[#FC6200] text-white font-semibold px-8 py-3 rounded-xl transition-all">
                Update ROI Summary →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
