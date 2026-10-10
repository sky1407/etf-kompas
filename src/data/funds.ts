export type Source = {
  label: string;
  url: string;
  accessed: string;
};

export type TwinMatch = "same-index" | "similar";

export type UcitsEtf = {
  id: string;
  ticker: string;
  lseTicker: string;
  name: string;
  isin: string;
  index: string;
  terPct: number;
  aumEurM: number;
  distribution: "acc" | "dist";
  replication: string;
  domicile: "IE";
  inceptionYear: number;
  source: Source;
};

export type UsEtf = {
  ticker: string;
  name: string;
  label: string;
  exchange: "NYSE Arca";
  index: string;
  terPct: number;
  aumUsdBn: number;
  inceptionYear: number;
  twins: { id: string; match: TwinMatch }[];
  source: Source;
};

const justEtf = (isin: string): Source => ({
  label: "justETF",
  url: `https://www.justetf.com/en/etf-profile.html?isin=${isin}`,
  accessed: "2026-10-10",
});

const stockAnalysis = (ticker: string): Source => ({
  label: "StockAnalysis (close 9. 10. 2026)",
  url: `https://stockanalysis.com/etf/${ticker.toLowerCase()}/`,
  accessed: "2026-10-10",
});

export const ucitsEtfs: Record<string, UcitsEtf> = {
  cspx: {
    id: "cspx",
    ticker: "SXR8",
    lseTicker: "CSPX",
    name: "iShares Core S&P 500 UCITS ETF (Acc)",
    isin: "IE00B5BMR087",
    index: "S&P 500",
    terPct: 0.07,
    aumEurM: 141385,
    distribution: "acc",
    replication: "fyzická (plná)",
    domicile: "IE",
    inceptionYear: 2010,
    source: justEtf("IE00B5BMR087"),
  },
  vuaa: {
    id: "vuaa",
    ticker: "VUAA",
    lseTicker: "VUAA",
    name: "Vanguard S&P 500 UCITS ETF (Acc)",
    isin: "IE00BFMXXD54",
    index: "S&P 500",
    terPct: 0.07,
    aumEurM: 33371,
    distribution: "acc",
    replication: "fyzická (plná)",
    domicile: "IE",
    inceptionYear: 2019,
    source: justEtf("IE00BFMXXD54"),
  },
  xd9u: {
    id: "xd9u",
    ticker: "XD9U",
    lseTicker: "XD9U",
    name: "Xtrackers MSCI USA UCITS ETF 1C",
    isin: "IE00BJ0KDR00",
    index: "MSCI USA",
    terPct: 0.03,
    aumEurM: 12329,
    distribution: "acc",
    replication: "fyzická (plná)",
    domicile: "IE",
    inceptionYear: 2014,
    source: justEtf("IE00BJ0KDR00"),
  },
  vwce: {
    id: "vwce",
    ticker: "VWCE",
    lseTicker: "VWRA",
    name: "Vanguard FTSE All-World UCITS ETF (Acc)",
    isin: "IE00BK5BQT80",
    index: "FTSE All-World",
    terPct: 0.14,
    aumEurM: 55102,
    distribution: "acc",
    replication: "fyzická (optimalizovaná)",
    domicile: "IE",
    inceptionYear: 2019,
    source: justEtf("IE00BK5BQT80"),
  },
  fwia: {
    id: "fwia",
    ticker: "FWIA",
    lseTicker: "FWRA",
    name: "Invesco FTSE All-World UCITS ETF Acc",
    isin: "IE000716YHJ7",
    index: "FTSE All-World",
    terPct: 0.15,
    aumEurM: 4277,
    distribution: "acc",
    replication: "fyzická (optimalizovaná)",
    domicile: "IE",
    inceptionYear: 2023,
    source: justEtf("IE000716YHJ7"),
  },
  spyd: {
    id: "spyd",
    ticker: "SPYD",
    lseTicker: "UDVD",
    name: "SPDR S&P U.S. Dividend Aristocrats UCITS ETF (Dist)",
    isin: "IE00B6YX5D40",
    index: "S&P High Yield Dividend Aristocrats",
    terPct: 0.35,
    aumEurM: 3261,
    distribution: "dist",
    replication: "fyzická (plná)",
    domicile: "IE",
    inceptionYear: 2011,
    source: justEtf("IE00B6YX5D40"),
  },
};

export const usEtfs: UsEtf[] = [
  {
    ticker: "VOO",
    label: "S&P 500",
    name: "Vanguard S&P 500 ETF",
    exchange: "NYSE Arca",
    index: "S&P 500",
    terPct: 0.03,
    aumUsdBn: 1060,
    inceptionYear: 2010,
    twins: [
      { id: "cspx", match: "same-index" },
      { id: "vuaa", match: "same-index" },
    ],
    source: stockAnalysis("VOO"),
  },
  {
    ticker: "SPY",
    label: "S&P 500",
    name: "SPDR S&P 500 ETF Trust",
    exchange: "NYSE Arca",
    index: "S&P 500",
    terPct: 0.0945,
    aumUsdBn: 821,
    inceptionYear: 1993,
    twins: [
      { id: "cspx", match: "same-index" },
      { id: "vuaa", match: "same-index" },
    ],
    source: {
      label: "State Street (SSGA)",
      url: "https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-sp-500-etf-trust-spy",
      accessed: "2026-10-10",
    },
  },
  {
    ticker: "IVV",
    label: "S&P 500",
    name: "iShares Core S&P 500 ETF",
    exchange: "NYSE Arca",
    index: "S&P 500",
    terPct: 0.03,
    aumUsdBn: 896,
    inceptionYear: 2000,
    twins: [
      { id: "cspx", match: "same-index" },
      { id: "vuaa", match: "same-index" },
    ],
    source: stockAnalysis("IVV"),
  },
  {
    ticker: "VTI",
    label: "celé USA",
    name: "Vanguard Total Stock Market ETF",
    exchange: "NYSE Arca",
    index: "Morningstar US Total Market",
    terPct: 0.03,
    aumUsdBn: 703,
    inceptionYear: 2001,
    twins: [{ id: "xd9u", match: "similar" }],
    source: stockAnalysis("VTI"),
  },
  {
    ticker: "VT",
    label: "celý svět",
    name: "Vanguard Total World Stock ETF",
    exchange: "NYSE Arca",
    index: "FTSE Global All Cap",
    terPct: 0.06,
    aumUsdBn: 82.7,
    inceptionYear: 2008,
    twins: [
      { id: "vwce", match: "similar" },
      { id: "fwia", match: "similar" },
    ],
    source: stockAnalysis("VT"),
  },
  {
    ticker: "SCHD",
    label: "dividendy",
    name: "Schwab US Dividend Equity ETF",
    exchange: "NYSE Arca",
    index: "Dow Jones U.S. Dividend 100",
    terPct: 0.06,
    aumUsdBn: 108.9,
    inceptionYear: 2011,
    twins: [{ id: "spyd", match: "similar" }],
    source: stockAnalysis("SCHD"),
  },
];

export const bankFundBenchmark = {
  label: "Průměrný akciový fond (ne-ETF) v EU",
  ongoingPct: 1.38,
  entryPctPerYear: 0.51,
  totalPct: 1.9,
  source: {
    label: "ESMA Market Report 2025, str. 6",
    url: "https://www.esma.europa.eu/sites/default/files/2026-03/ESMA50-1949966494-4065_Market_Report_-_Costs_and_Performance_of_EU_Retail_Investment_Products.pdf",
    accessed: "2026-10-10",
  },
} as const;

export const dataAsOf = "2026-10-10";
