export const firmCategories = {
    "Bulge Bracket Investment Banks": [
      "Bank of America Merrill Lynch",
      "Barclays",
      "Citigroup",
      "Deutsche Bank",
      "Goldman Sachs",
      "J.P. Morgan",
      "Morgan Stanley",
      "UBS"
    ],
    
    "International Investment Banks": [
      "BMO Capital Markets",
      "BNP Paribas",
      "HSBC",
      "Nomura",
      "RBC Capital Markets",
      "Société Générale",
      "Wells Fargo Securities"
    ],
    
    "Elite Boutique Investment Banks": [
      "Centerview Partners",
      "Evercore",
      "Greenhill & Co.",
      "Guggenheim Partners",
      "Harris Williams",
      "Houlihan Lokey",
      "Jefferies",
      "Lazard",
      "Lincoln International",
      "LionTree",
      "Macquarie Capital",
      "Moelis & Company",
      "Oppenheimer & Co.",
      "Perella Weinberg Partners",
      "Piper Sandler",
      "PJT Partners",
      "Qatalyst Partners",
      "Raymond James",
      "Robert Baird",
      "Rothschild & Co",
      "Stifel",
      "William Blair"
    ],
    
    "Mega-Fund Private Equity": [
      "Advent International",
      "Apollo Global Management",
      "Bain Capital",
      "Blackstone",
      "Brookfield Asset Management",
      "CVC Capital Partners",
      "EQT",
      "KKR",
      "Silver Lake",
      "The Carlyle Group",
      "Thoma Bravo",
      "TPG",
      "Vista Equity Partners",
      "Warburg Pincus"
    ],
    
    "Large-Cap Private Equity": [
      "Apax Partners",
      "Audax Group",
      "Cinven",
      "Clayton Dubilier & Rice",
      "Francisco Partners",
      "General Atlantic",
      "GTCR",
      "Hellman & Friedman",
      "Hg Capital",
      "Insight Partners",
      "Leonard Green & Partners",
      "Nordic Capital",
      "PAI Partners",
      "Permira",
      "Welsh Carson Anderson & Stowe"
    ],
    
    "Mid-Market Private Equity": [
      "Ardian",
      "H.I.G. Capital",
      "Intermediate Capital Group (ICG)",
      "Irving Place Capital",
      "Marlin Equity Partners",
      "Mason Wells",
      "Monroe Capital",
      "Oak Hill Capital",
      "Platinum Equity",
      "Snow Phipps Group",
      "The Gores Group",
      "The Riverside Company",
      "Trivest Partners",
      "TSG Consumer Partners",
      "Wind Point Partners"
    ],
    
    "Growth Equity": [
      "Accel-KKR",
      "Battery Ventures",
      "Bregal Sagemount",
      "BuildGroup",
      "Clearlake Capital",
      "Great Hill Partners",
      "JMI Equity",
      "K1 Investment Management",
      "PSG",
      "Riverwood Capital",
      "Spectrum Equity",
      "Summit Partners",
      "TA Associates",
      "Vector Capital"
    ],
    
    "Hedge Funds": [
      "AQR Capital Management",
      "Balyasny Asset Management",
      "Brevan Howard",
      "Bridgewater Associates",
      "Citadel",
      "DE Shaw & Co",
      "Elliott Management",
      "ExodusPoint Capital Management",
      "Lone Pine Capital",
      "Man Group",
      "Marshall Wace",
      "Millennium Management",
      "Och-Ziff Capital Management",
      "Point72",
      "Renaissance Technologies",
      "Sculptor Capital Management",
      "Third Point",
      "Tiger Global Management",
      "Two Sigma",
      "Viking Global Investors"
    ],
    
    "Strategy Consulting (MBB)": [
      "Bain & Company",
      "Boston Consulting Group (BCG)",
      "McKinsey & Company"
    ],
    
    "Big Four Consulting": [
      "Deloitte Consulting",
      "EY-Parthenon / EY Consulting",
      "KPMG Advisory",
      "PwC Advisory / Strategy&"
    ],
    
    "Other Consulting Firms": [
      "Accenture",
      "AlixPartners",
      "Booz Allen Hamilton",
      "Cornerstone Research",
      "FTI Consulting",
      "Huron Consulting",
      "Kearney (formerly A.T. Kearney)",
      "L.E.K. Consulting",
      "Oliver Wyman",
      "PA Consulting",
      "Roland Berger",
      "Simon-Kucher & Partners"
    ],
    
    "Tech (FAANG+)": [
      "Adobe",
      "Airbnb",
      "Amazon",
      "Apple",
      "Google (Alphabet)",
      "Meta (Facebook)",
      "Microsoft",
      "Netflix",
      "NVIDIA",
      "Oracle",
      "Palantir",
      "Salesforce",
      "SpaceX",
      "Stripe",
      "Tesla",
      "Uber"
    ],
    
    "Venture Capital": [
      "Accel",
      "Andreessen Horowitz",
      "Battery Ventures",
      "Benchmark",
      "Bessemer Venture Partners",
      "Founders Fund",
      "General Catalyst",
      "Greylock Partners",
      "Index Ventures",
      "Insight Partners",
      "Kleiner Perkins",
      "Lightspeed Venture Partners",
      "NEA (New Enterprise Associates)",
      "Sequoia Capital",
      "Tiger Global"
    ]
  }
  
  // Flatten all firms into a single sorted array for easy searching
  export const allFirms = Object.values(firmCategories)
    .flat()
    .sort((a, b) => a.localeCompare(b))
  
  // Get all unique firm types
  export const firmTypes = Object.keys(firmCategories)