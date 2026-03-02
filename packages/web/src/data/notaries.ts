export interface Notary {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  specialties: string[];
  slug: string;
}

export const notaries: Notary[] = [
  {
    id: 1,
    name: "Notariskantoor Van der Berg",
    city: "Amsterdam",
    address: "Herengracht 456, 1017 CA Amsterdam",
    phone: "+31 20 123 4567",
    specialties: ["Testament", "Erfrecht", "Vastgoed"],
    slug: "notariskantoor-van-der-berg-amsterdam"
  },
  {
    id: 2,
    name: "De Jong Notarissen",
    city: "Amsterdam",
    address: "Keizersgracht 234, 1016 DV Amsterdam",
    phone: "+31 20 234 5678",
    specialties: ["Erfrecht", "Familierecht", "Ondernemingsrecht"],
    slug: "de-jong-notarissen-amsterdam"
  },
  {
    id: 3,
    name: "Notaris Jansen & Partners",
    city: "Rotterdam",
    address: "Coolsingel 88, 3012 AG Rotterdam",
    phone: "+31 10 345 6789",
    specialties: ["Testament", "Vastgoed", "Ondernemingsrecht"],
    slug: "notaris-jansen-partners-rotterdam"
  },
  {
    id: 4,
    name: "Bakker Notarissen",
    city: "Rotterdam",
    address: "Westersingel 12, 3014 GP Rotterdam",
    phone: "+31 10 456 7890",
    specialties: ["Erfrecht", "Vastgoed", "Familierecht"],
    slug: "bakker-notarissen-rotterdam"
  },
  {
    id: 5,
    name: "Notariskantoor Visser",
    city: "Den Haag",
    address: "Lange Voorhout 45, 2514 EC Den Haag",
    phone: "+31 70 567 8901",
    specialties: ["Testament", "Erfrecht", "Internationale zaken"],
    slug: "notariskantoor-visser-den-haag"
  },
  {
    id: 6,
    name: "Smit & Smit Notarissen",
    city: "Den Haag",
    address: "Prinsestraat 23, 2513 CA Den Haag",
    phone: "+31 70 678 9012",
    specialties: ["Vastgoed", "Ondernemingsrecht", "Testament"],
    slug: "smit-smit-notarissen-den-haag"
  },
  {
    id: 7,
    name: "Notaris De Vries",
    city: "Utrecht",
    address: "Oudegracht 156, 3511 AX Utrecht",
    phone: "+31 30 789 0123",
    specialties: ["Testament", "Erfrecht", "Familierecht"],
    slug: "notaris-de-vries-utrecht"
  },
  {
    id: 8,
    name: "Van Leeuwen Notarissen",
    city: "Utrecht",
    address: "Domplein 8, 3512 JC Utrecht",
    phone: "+31 30 890 1234",
    specialties: ["Erfrecht", "Vastgoed", "Testament"],
    slug: "van-leeuwen-notarissen-utrecht"
  },
  {
    id: 9,
    name: "Notariskantoor Hendriks",
    city: "Eindhoven",
    address: "Stratumseind 45, 5611 EN Eindhoven",
    phone: "+31 40 901 2345",
    specialties: ["Testament", "Ondernemingsrecht", "Vastgoed"],
    slug: "notariskantoor-hendriks-eindhoven"
  },
  {
    id: 10,
    name: "Peters Notarissen",
    city: "Eindhoven",
    address: "Hoogstraat 67, 5611 KM Eindhoven",
    phone: "+31 40 012 3456",
    specialties: ["Erfrecht", "Familierecht", "Testament"],
    slug: "peters-notarissen-eindhoven"
  },
  {
    id: 11,
    name: "Notaris Mulder",
    city: "Amstelveen",
    address: "Stadsplein 12, 1181 ZM Amstelveen",
    phone: "+31 20 123 4568",
    specialties: ["Testament", "Erfrecht", "Vastgoed"],
    slug: "notaris-mulder-amstelveen"
  },
  {
    id: 12,
    name: "Bos & Partners Notarissen",
    city: "Amstelveen",
    address: "Van der Hooplaan 89, 1185 BW Amstelveen",
    phone: "+31 20 234 5679",
    specialties: ["Erfrecht", "Internationale zaken", "Testament"],
    slug: "bos-partners-notarissen-amstelveen"
  },
  {
    id: 13,
    name: "Notariskantoor Dijkstra",
    city: "Groningen",
    address: "Grote Markt 34, 9711 LV Groningen",
    phone: "+31 50 345 6780",
    specialties: ["Testament", "Erfrecht", "Familierecht"],
    slug: "notariskantoor-dijkstra-groningen"
  },
  {
    id: 14,
    name: "Van Dam Notarissen",
    city: "Groningen",
    address: "Folkingestraat 56, 9711 JS Groningen",
    phone: "+31 50 456 7891",
    specialties: ["Vastgoed", "Ondernemingsrecht", "Testament"],
    slug: "van-dam-notarissen-groningen"
  },
  {
    id: 15,
    name: "Notaris Vermeulen",
    city: "Tilburg",
    address: "Heuvelstraat 78, 5038 AD Tilburg",
    phone: "+31 13 567 8902",
    specialties: ["Testament", "Erfrecht", "Vastgoed"],
    slug: "notaris-vermeulen-tilburg"
  },
  {
    id: 16,
    name: "Kuipers & Kuipers Notarissen",
    city: "Tilburg",
    address: "Paleisring 23, 5041 AD Tilburg",
    phone: "+31 13 678 9013",
    specialties: ["Erfrecht", "Familierecht", "Testament"],
    slug: "kuipers-kuipers-notarissen-tilburg"
  },
  {
    id: 17,
    name: "Notariskantoor Schouten",
    city: "Almere",
    address: "Stadhuisplein 12, 1315 HN Almere",
    phone: "+31 36 789 0124",
    specialties: ["Testament", "Vastgoed", "Ondernemingsrecht"],
    slug: "notariskantoor-schouten-almere"
  },
  {
    id: 18,
    name: "Hoekstra Notarissen",
    city: "Almere",
    address: "Buitenring 45, 1324 AB Almere",
    phone: "+31 36 890 1235",
    specialties: ["Erfrecht", "Testament", "Familierecht"],
    slug: "hoekstra-notarissen-almere"
  },
  {
    id: 19,
    name: "Notaris Van Dijk",
    city: "Breda",
    address: "Grote Markt 56, 4811 XS Breda",
    phone: "+31 76 901 2346",
    specialties: ["Testament", "Erfrecht", "Vastgoed"],
    slug: "notaris-van-dijk-breda"
  },
  {
    id: 20,
    name: "Willems Notarissen",
    city: "Breda",
    address: "Karrestraat 89, 4811 BK Breda",
    phone: "+31 76 012 3457",
    specialties: ["Erfrecht", "Ondernemingsrecht", "Testament"],
    slug: "willems-notarissen-breda"
  }
];
