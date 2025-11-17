import { createContext, useContext, useState, ReactNode } from "react";

export type Currency = "ZAR" | "USD" | "EUR" | "GBP";
export type Language = "EN" | "ES" | "FR" | "DE";

interface CurrencyContextType {
  currency: Currency;
  language: Language;
  setCurrency: (currency: Currency) => void;
  setLanguage: (language: Language) => void;
  convertPrice: (price: number) => string;
  formatPrice: (price: number) => string;
}

const exchangeRates: Record<Currency, number> = {
  ZAR: 1,
  USD: 0.054,
  EUR: 0.049,
  GBP: 0.042,
};

const currencySymbols: Record<Currency, string> = {
  ZAR: "R",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>("ZAR");
  const [language, setLanguage] = useState<Language>("EN");

  const convertPrice = (priceInZAR: number): string => {
    const converted = priceInZAR * exchangeRates[currency];
    return converted.toFixed(2);
  };

  const formatPrice = (priceInZAR: number): string => {
    const converted = convertPrice(priceInZAR);
    return `${currencySymbols[currency]}${converted}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        language,
        setCurrency,
        setLanguage,
        convertPrice,
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
