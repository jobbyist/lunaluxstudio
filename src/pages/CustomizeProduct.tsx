import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShoppingCart, Info, Sparkles, Check } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
import productImage from "@/assets/product-placeholder.webp";

// Types
interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  skuCode: string;
}

interface BaseBundle {
  id: string;
  name: string;
  description: string;
  price: number;
  skuCode: string;
}

// Base Length Options
const baseBundles: BaseBundle[] = [
  { id: "length-16", name: '16"', description: "Base length for your custom wig", price: 2200, skuCode: "L16" },
  { id: "length-18", name: '18"', description: "Base length for your custom wig", price: 2400, skuCode: "L18" },
  { id: "length-20", name: '20"', description: "Base length for your custom wig", price: 2800, skuCode: "L20" },
  { id: "length-22", name: '22"', description: "Base length for your custom wig", price: 3200, skuCode: "L22" },
  { id: "length-24", name: '24"', description: "Base length for your custom wig", price: 4000, skuCode: "L24" },
  { id: "length-26", name: '26"', description: "Base length for your custom wig", price: 4200, skuCode: "L26" },
  { id: "length-28", name: '28"', description: "Base length for your custom wig", price: 4400, skuCode: "L28" },
];

// Cap Size Options (Free)
const capSizeOptions: CustomizationOption[] = [
  { id: "small", name: "Small (S)", price: 0, skuCode: "S" },
  { id: "medium", name: "Medium (M)", price: 0, skuCode: "M" },
  { id: "large", name: "Large (L)", price: 0, skuCode: "L" },
];

// Color Options
const colorOptions: CustomizationOption[] = [
  { id: "natural-1b", name: "Natural 1B Black", price: 0, skuCode: "1B" },
  { id: "jet-black", name: "Jet Black", price: 400, skuCode: "JB" },
  { id: "chestnut-brown", name: "Chestnut Brown", price: 900, skuCode: "CB" },
];

// Customisation Options
const customisationOptions: CustomizationOption[] = [
  { id: "standard", name: "Standard Bleaching + Plucking", price: 150, skuCode: "SBP" },
  { id: "extra-plucking", name: "Extra Plucking", price: 100, skuCode: "EP" },
];

// Styling Options
const stylingOptions: CustomizationOption[] = [
  { id: "straight", name: "Straight", price: 0, skuCode: "STR" },
  { id: "tight-curl", name: "Tight Curl", price: 100, skuCode: "TC" },
  { id: "loose-curl", name: "Loose Curl", price: 100, skuCode: "LC" },
];

// Cut Options
const cutOptions: CustomizationOption[] = [
  { id: "none", name: "None", price: 0, skuCode: "CN" },
  { id: "natural-layers", name: "Natural Layers", price: 200, skuCode: "NL" },
  { id: "dramatic-layers", name: "Dramatic Layers", price: 250, skuCode: "DL" },
];

// Texture Options
const textureOptions: CustomizationOption[] = [
  { id: "straight", name: "Straight", price: 0, skuCode: "TST" },
  { id: "body-wave", name: "Body Wave", price: 0, skuCode: "TBW" },
  { id: "deep-wave", name: "Deep Wave", price: 200, skuCode: "TDW" },
  { id: "water-wave", name: "Water Wave", price: 200, skuCode: "TWW" },
  { id: "italian-curly", name: "Italian Curly", price: 200, skuCode: "TIC" },
];

// Hair Type Options
const hairTypeOptions: CustomizationOption[] = [
  { id: "brazilian", name: "Brazilian (Standard)", price: 0, skuCode: "HBZ" },
  { id: "vietnamese", name: "Vietnamese", price: 1500, skuCode: "HVN" },
  { id: "raw-hair", name: "Raw Hair", price: 2500, skuCode: "HRW" },
];

// Closure/Frontal Options
const closureFrontalOptions: CustomizationOption[] = [
  { id: "5x5-closure", name: "5x5 Closure", price: 800, skuCode: "C55" },
  { id: "5x5-hd-closure", name: "5x5 HD Closure", price: 1400, skuCode: "C55HD" },
  { id: "6x6-hd-closure", name: "6x6 HD Closure", price: 1800, skuCode: "C66HD" },
  { id: "13x4-frontal", name: "13x4 Frontal", price: 1500, skuCode: "F134" },
  { id: "13x4-hd-frontal", name: "13x4 HD Frontal", price: 1900, skuCode: "F134HD" },
];

// Tooltip content
const tooltips: Record<string, string> = {
  baseBundle: "Select your wig length. This sets the base price before any upgrades.",
  texture: "Choose the hair texture for your wig. Some textures include an upgrade.",
  hairType: "Choose your hair type. Premium hair types add to the base price.",
  capSize: "Choose your cap size for the perfect fit. This is a free option.",
  color: "Select your preferred hair color. Natural 1B Black is included free.",
  customisation: "Add professional finishing touches to your wig.",
  styling: "Choose how you'd like your hair styled. Straight styling is included free.",
  cut: "Add professional layering to your wig for extra dimension.",
  closureFrontal: "Choose your closure or frontal type for a natural hairline.",
};

// SKU counter (in production, this would come from database)
let skuCounter = 10001;

export default function CustomizeProduct() {
  const { formatPrice } = useCurrency();
  const addItem = useCartStore((state) => state.addItem);
  
  // State for selections
  const [selectedBundle, setSelectedBundle] = useState<BaseBundle | null>(null);
  const [selectedTexture, setSelectedTexture] = useState<CustomizationOption | null>(null);
  const [selectedHairType, setSelectedHairType] = useState<CustomizationOption | null>(null);
  const [selectedCapSize, setSelectedCapSize] = useState<CustomizationOption>(capSizeOptions[1]); // Default Medium
  const [selectedColor, setSelectedColor] = useState<CustomizationOption>(colorOptions[0]);
  const [selectedCustomisation, setSelectedCustomisation] = useState<CustomizationOption | null>(null);
  const [selectedStyling, setSelectedStyling] = useState<CustomizationOption>(stylingOptions[0]);
  const [selectedCut, setSelectedCut] = useState<CustomizationOption>(cutOptions[0]);
  const [selectedClosureFrontal, setSelectedClosureFrontal] = useState<CustomizationOption | null>(null);
  
  // Tooltip dismiss state
  const [dismissedTooltips, setDismissedTooltips] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("luna-dismissed-tooltips");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(() => {
    return !localStorage.getItem("luna-customizer-welcomed");
  });

  // Save dismissed tooltips to localStorage
  useEffect(() => {
    localStorage.setItem("luna-dismissed-tooltips", JSON.stringify([...dismissedTooltips]));
  }, [dismissedTooltips]);

  const dismissTooltip = (key: string) => {
    setDismissedTooltips(prev => new Set([...prev, key]));
  };

  const dismissWelcomeGuide = () => {
    setShowWelcomeGuide(false);
    localStorage.setItem("luna-customizer-welcomed", "true");
  };

  // Calculate total price
  const calculateTotal = (): number => {
    if (!selectedBundle) return 0;
    
    let total = selectedBundle.price;
    total += selectedTexture?.price || 0;
    total += selectedHairType?.price || 0;
    total += selectedClosureFrontal?.price || 0;
    total += selectedCapSize.price;
    total += selectedColor.price;
    total += selectedCustomisation?.price || 0;
    total += selectedStyling.price;
    total += selectedCut.price;
    
    return total;
  };

  // Generate unique SKU
  const generateSKU = (): string => {
    if (!selectedBundle) return "LUNA-CUSTOM-00000";
    return `LUNA-CUSTOM-${skuCounter++}`;
  };

  // Build configuration summary
  const getConfigSummary = (): string => {
    const parts = [
      selectedBundle ? `${selectedBundle.name} Length` : null,
      selectedTexture?.name,
      selectedHairType?.name,
      selectedClosureFrontal?.name,
      selectedCapSize.name,
      selectedColor.name,
      selectedCustomisation?.name,
      selectedStyling.name,
      selectedCut.name !== "None" ? selectedCut.name : null,
    ].filter(Boolean);
    
    return parts.join(" • ");
  };

  const handleAddToCart = () => {
    if (!selectedBundle) {
      toast.error("Please select a length first", {
        description: "Choose a wig length to continue."
      });
      return;
    }

    if (!selectedTexture) {
      toast.error("Please select a texture", {
        description: "Choose your preferred texture to continue."
      });
      return;
    }

    if (!selectedHairType) {
      toast.error("Please select a hair type", {
        description: "Choose your hair type to continue."
      });
      return;
    }

    if (!selectedClosureFrontal) {
      toast.error("Please select a closure or frontal", {
        description: "Choose a closure or frontal to continue."
      });
      return;
    }

    const sku = generateSKU();
    const total = calculateTotal();

    const cartItem = {
      product: {
        node: {
          id: sku,
          title: "Custom Luna Luxury Wig",
          description: getConfigSummary(),
          handle: "custom-wig",
          priceRange: {
            minVariantPrice: {
              amount: total.toString(),
              currencyCode: "ZAR"
            }
          },
          images: {
            edges: [{
              node: {
                url: productImage,
                altText: "Custom Wig"
              }
            }]
          },
          variants: { edges: [] },
          options: []
        }
      },
      variantId: sku,
      variantTitle: getConfigSummary(),
      price: {
        amount: total.toString(),
        currencyCode: "ZAR"
      },
      quantity: 1,
      selectedOptions: [
        { name: "Length", value: selectedBundle.name },
        { name: "Texture", value: selectedTexture.name },
        { name: "Hair Type", value: selectedHairType.name },
        { name: "Closure/Frontal", value: selectedClosureFrontal.name },
        { name: "Cap Size", value: selectedCapSize.name },
        { name: "Color", value: selectedColor.name },
        { name: "Customisation", value: selectedCustomisation?.name || "None" },
        { name: "Styling", value: selectedStyling.name },
        { name: "Cut", value: selectedCut.name },
        { name: "Free Shipping", value: "Yes" },
      ],
      customSku: sku, // Custom SKU for order processing
      isCustomWig: true, // Flag for custom wig checkout handling
    };

    addItem(cartItem);
    toast.success("Added to cart!", {
      description: `Your custom wig (${sku}) with FREE SHIPPING has been added.`
    });
  };

  const total = calculateTotal();
  const isBaseComplete = Boolean(selectedBundle && selectedTexture && selectedHairType && selectedClosureFrontal);

  // Helper component for section with tooltip
  const SectionHeader = ({ title, tooltipKey, isFree = false }: { title: string; tooltipKey: string; isFree?: boolean }) => (
    <div className="flex items-center gap-2">
      <Label className="text-lg font-medium">{title}</Label>
      {isFree && <Badge variant="secondary" className="text-xs">Free</Badge>}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p>{tooltips[tooltipKey]}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  // Option card component
  const OptionCard = ({ 
    option, 
    isSelected, 
    onClick,
    showPrice = true 
  }: { 
    option: CustomizationOption; 
    isSelected: boolean; 
    onClick: () => void;
    showPrice?: boolean;
  }) => (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "border-primary bg-primary/10 shadow-md"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2">
          <Check className="w-4 h-4 text-primary" />
        </div>
      )}
      <span className="font-semibold text-center">{option.name}</span>
      {showPrice && option.price > 0 && (
        <span className="text-xs text-primary mt-1">+{formatPrice(option.price)}</span>
      )}
      {showPrice && option.price === 0 && (
        <span className="text-xs text-muted-foreground mt-1">Included</span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageTransition>
      <main className="pt-36 md:pt-40 pb-16">
        <div className="container mx-auto px-4">
          {/* Welcome Guide Modal */}
          {showWelcomeGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="bg-card border rounded-xl p-8 max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-serif">Welcome to the Customizer!</h2>
                </div>
                <div className="space-y-3 text-muted-foreground mb-6">
                  <p>Build your perfect custom wig in just a few steps:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li><strong>Choose your base wig</strong> – Select length, texture, and hair type</li>
                    <li><strong>Pick closure or frontal</strong> – This completes the base wig</li>
                    <li><strong>Select extras</strong> – Cap size, color, styling & more</li>
                    <li><strong>Review your total</strong> – Prices update in real-time</li>
                    <li><strong>Add to cart</strong> – A unique SKU is generated for your order</li>
                  </ol>
                  <p className="text-xs">Look for the <Info className="w-3 h-3 inline" /> icon next to each section for helpful tips!</p>
                </div>
                <Button onClick={dismissWelcomeGuide} className="w-full btn-glow">
                  Start Customizing
                </Button>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Product Image - Single image */}
            <div className="lg:sticky lg:top-40 lg:self-start space-y-4">
              <div className="aspect-square bg-card rounded-xl overflow-hidden shadow-lg">
                <img
                  src={productImage}
                  alt="Custom Wig Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Configuration Summary */}
              {selectedBundle && (
                <div className="p-4 bg-card/50 rounded-lg border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Your Configuration</h3>
                  <p className="text-sm">{getConfigSummary()}</p>
                </div>
              )}
            </div>

            {/* Customization Options */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-serif mb-2">Build Your Perfect Look</h1>
                <p className="text-muted-foreground">Customize every detail of your luxury wig</p>
              </div>

              {/* STEP 1: Base Wig Length */}
              <div className="space-y-4 p-6 bg-card rounded-xl border-2 border-dashed border-primary/30">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">Step 1</Badge>
                  <SectionHeader title="Choose Your Length" tooltipKey="baseBundle" />
                </div>
                <p className="text-sm text-muted-foreground">Select your wig length to set the base price.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {baseBundles.map((bundle) => (
                    <div
                      key={bundle.id}
                      onClick={() => setSelectedBundle(bundle)}
                      className={`relative flex items-center justify-between p-5 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedBundle?.id === bundle.id
                          ? "border-primary bg-primary/10 shadow-lg"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {selectedBundle?.id === bundle.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-lg">{bundle.name}</p>
                          <p className="text-sm text-muted-foreground">{bundle.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">{formatPrice(bundle.price)}</p>
                        <p className="text-xs text-muted-foreground">Base price</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Show remaining options only after length is selected */}
              {selectedBundle && (
                <>
                  <Separator />

                  {/* Step 2: Texture */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground">Step 2</Badge>
                      <SectionHeader title="Texture" tooltipKey="texture" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {textureOptions.map((option) => (
                        <OptionCard
                          key={option.id}
                          option={option}
                          isSelected={selectedTexture?.id === option.id}
                          onClick={() => setSelectedTexture(option)}
                        />
                      ))}
                    </div>
                  </div>

                  {selectedTexture && (
                    <>
                      <Separator />

                      {/* Step 3: Hair Type */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary text-primary-foreground">Step 3</Badge>
                          <SectionHeader title="Hair Type" tooltipKey="hairType" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {hairTypeOptions.map((option) => (
                            <OptionCard
                              key={option.id}
                              option={option}
                              isSelected={selectedHairType?.id === option.id}
                              onClick={() => setSelectedHairType(option)}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedTexture && selectedHairType && (
                    <>
                      <Separator />

                      {/* Step 4: Closure / Frontal */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary text-primary-foreground">Step 4</Badge>
                          <SectionHeader title="Closure / Frontal" tooltipKey="closureFrontal" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {closureFrontalOptions.map((option) => (
                            <OptionCard
                              key={option.id}
                              option={option}
                              isSelected={selectedClosureFrontal?.id === option.id}
                              onClick={() => setSelectedClosureFrontal(option)}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {selectedTexture && selectedHairType && selectedClosureFrontal && (
                    <>
                      <Separator />

                      {/* Step 5: Extras */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary text-primary-foreground">Step 5</Badge>
                          <h3 className="text-lg font-medium">Extras (Optional)</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Add any optional customization extras below.</p>
                      </div>

                      {/* Cap Size (Free) */}
                      <div className="space-y-4">
                        <SectionHeader title="Cap Size" tooltipKey="capSize" isFree />
                        <div className="grid grid-cols-3 gap-3">
                          {capSizeOptions.map((option) => (
                            <OptionCard
                              key={option.id}
                              option={option}
                              isSelected={selectedCapSize.id === option.id}
                              onClick={() => setSelectedCapSize(option)}
                              showPrice={false}
                            />
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Color */}
                      <div className="space-y-4">
                        <SectionHeader title="Color" tooltipKey="color" />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {colorOptions.map((option) => (
                            <OptionCard
                              key={option.id}
                              option={option}
                              isSelected={selectedColor.id === option.id}
                              onClick={() => setSelectedColor(option)}
                            />
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Customisation */}
                      <div className="space-y-4">
                        <SectionHeader title="Customisation" tooltipKey="customisation" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {customisationOptions.map((option) => (
                            <OptionCard
                              key={option.id}
                              option={option}
                              isSelected={selectedCustomisation?.id === option.id}
                              onClick={() => setSelectedCustomisation(
                                selectedCustomisation?.id === option.id ? null : option
                              )}
                            />
                          ))}
                        </div>
                        {selectedCustomisation && (
                          <button 
                            onClick={() => setSelectedCustomisation(null)}
                            className="text-xs text-muted-foreground hover:text-foreground underline"
                          >
                            Clear selection
                          </button>
                        )}
                      </div>

                      <Separator />

                      {/* Styling */}
                      <div className="space-y-4">
                        <SectionHeader title="Styling" tooltipKey="styling" />
                        <div className="grid grid-cols-3 gap-3">
                          {stylingOptions.map((option) => (
                            <OptionCard
                              key={option.id}
                              option={option}
                              isSelected={selectedStyling.id === option.id}
                              onClick={() => setSelectedStyling(option)}
                            />
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Cut */}
                      <div className="space-y-4">
                        <SectionHeader title="Cut" tooltipKey="cut" />
                        <div className="grid grid-cols-3 gap-3">
                          {cutOptions.map((option) => (
                            <OptionCard
                              key={option.id}
                              option={option}
                              isSelected={selectedCut.id === option.id}
                              onClick={() => setSelectedCut(option)}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              <Separator />

              {/* Price Breakdown & Add to Cart */}
              <div className="space-y-4 sticky bottom-0 bg-background pt-4 pb-2">
                <div className="p-6 bg-card rounded-xl border shadow-lg space-y-4">
                  {/* Price Breakdown */}
                  {selectedBundle && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Length ({selectedBundle.name})</span>
                        <span>{formatPrice(selectedBundle.price)}</span>
                      </div>
                      {selectedTexture && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{selectedTexture.name}</span>
                          <span>
                            {selectedTexture.price > 0 ? `+${formatPrice(selectedTexture.price)}` : "Included"}
                          </span>
                        </div>
                      )}
                      {selectedHairType && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{selectedHairType.name}</span>
                          <span>
                            {selectedHairType.price > 0 ? `+${formatPrice(selectedHairType.price)}` : "Included"}
                          </span>
                        </div>
                      )}
                      {selectedClosureFrontal && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{selectedClosureFrontal.name}</span>
                          <span>+{formatPrice(selectedClosureFrontal.price)}</span>
                        </div>
                      )}
                      {selectedColor.price > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{selectedColor.name}</span>
                          <span>+{formatPrice(selectedColor.price)}</span>
                        </div>
                      )}
                      {selectedCustomisation && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{selectedCustomisation.name}</span>
                          <span>+{formatPrice(selectedCustomisation.price)}</span>
                        </div>
                      )}
                      {selectedStyling.price > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{selectedStyling.name}</span>
                          <span>+{formatPrice(selectedStyling.price)}</span>
                        </div>
                      )}
                      {selectedCut.price > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{selectedCut.name}</span>
                          <span>+{formatPrice(selectedCut.price)}</span>
                        </div>
                      )}
                      <Separator className="my-2" />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">{isBaseComplete ? formatPrice(total) : "—"}</span>
                  </div>
                  
                  <Button 
                    onClick={handleAddToCart}
                    size="lg" 
                    className="w-full text-lg py-6 btn-glow"
                    disabled={!isBaseComplete}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {isBaseComplete ? "Add to Cart" : "Complete Base Wig"}
                  </Button>
                  
                  {!isBaseComplete && (
                    <p className="text-xs text-center text-muted-foreground">
                      Please complete the base wig selections above to continue
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
