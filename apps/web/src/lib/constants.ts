// Shared constants used across the application

// Deduplicated flat list — cities that appear in multiple sub-regions were
// causing React 'duplicate key' warnings in the combobox.
const _ALL_INDIA_REGIONS = [
  // Major Metropolitan Cities
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
  "Kochi", "Coimbatore", "Thiruvananthapuram", "Mysore", "Mangalore",
  "Bhopal", "Patna", "Vadodara", "Ghaziabad", "Ludhiana",

  // Additional Major Cities
  "Agra", "Ajmer", "Aligarh", "Allahabad", "Amritsar",
  "Aurangabad", "Bareilly", "Belgaum", "Bhavnagar", "Bhiwandi",
  "Bhubaneswar", "Bikaner", "Bilaspur", "Bokaro", "Chandigarh",
  "Cuttack", "Dehradun", "Dhanbad", "Durgapur",
  "Erode", "Faridabad", "Gulbarga", "Guntur", "Gurgaon",
  "Guwahati", "Gwalior", "Hubli-Dharwad", "Imphal", "Jabalpur",
  "Jalandhar", "Jammu", "Jamnagar", "Jamshedpur", "Jodhpur",
  "Kakinada", "Kannur", "Kolhapur",
  "Kollam", "Kota", "Kozhikode", "Kurnool", "Latur",
  "Madurai", "Malappuram", "Mathura",
  "Meerut", "Moradabad", "Nanded",
  "Nashik", "Nellore", "Noida", "Palakkad",
  "Pondicherry", "Raipur", "Rajahmundry", "Rajkot",
  "Ranchi", "Salem", "Sangli", "Shimoga", "Siliguri",
  "Solapur", "Srinagar",
  "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Udaipur",
  "Varanasi", "Vasai-Virar", "Vijayawada", "Visakhapatnam", "Warangal",

  // Union Territories
  "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep", "Puducherry", "Jammu and Kashmir", "Ladakh"
];

// De-duplicate using Set to guarantee unique keys regardless of future edits
export const INDIA_REGIONS = Array.from(new Set(_ALL_INDIA_REGIONS)) as string[];

export type IndiaRegion = string;