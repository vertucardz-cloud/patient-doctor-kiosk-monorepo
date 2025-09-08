export function countryToRegion(country?: string): "America" | "Asia" | "Europe" | "Africa" | "Other" {
    if (!country) return "Other";
    const c = country.toLowerCase();
    if (["united states", "usa", "us", "canada", "mexico", "brazil", "argentina"].includes(c)) return "America";
    if (["india", "china", "japan", "singapore", "indonesia", "pakistan", "bangladesh", "vietnam"].includes(c)) return "Asia";
    if (["united kingdom", "uk", "germany", "france", "italy", "spain", "netherlands", "poland"].includes(c)) return "Europe";
    if (["nigeria", "south africa", "egypt", "kenya", "morocco"].includes(c)) return "Africa";
    return "Other";
}


export type IndiaRegion =
    | "North"
    | "South"
    | "East"
    | "West"
    | "Central"
    | "North-East"
    | "Other";

export function stateToRegion(state?: string): IndiaRegion {
    if (!state) return "Other";
    const s = state.toLowerCase();

    if (["delhi", "haryana", "punjab", "himachal pradesh", "jammu and kashmir", "uttarakhand", "uttar pradesh", "chandigarh"].includes(s)) {
        return "North";
    }
    if (["tamil nadu", "kerala", "karnataka", "andhra pradesh", "telangana", "puducherry"].includes(s)) {
        return "South";
    }
    if (["west bengal", "odisha", "bihar", "jharkhand"].includes(s)) {
        return "East";
    }
    if (["rajasthan", "gujarat", "maharashtra", "goa"].includes(s)) {
        return "West";
    }
    if (["madhya pradesh", "chhattisgarh"].includes(s)) {
        return "Central";
    }
    if (["assam", "manipur", "meghalaya", "mizoram", "nagaland", "tripura", "arunachal pradesh", "sikkim"].includes(s)) {
        return "North-East";
    }
    return "Other";
}
