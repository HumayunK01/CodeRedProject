// Shared constants used across the application

export const INDIA_REGIONS = [
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
  "Coimbatore", "Cuttack", "Dehradun", "Dhanbad", "Durgapur",
  "Erode", "Faridabad", "Gulbarga", "Guntur", "Gurgaon",
  "Guwahati", "Gwalior", "Hubli-Dharwad", "Imphal", "Jabalpur",
  "Jalandhar", "Jammu", "Jamnagar", "Jamshedpur", "Jodhpur",
  "Kakinada", "Kannur", "Kanpur", "Kochi", "Kolhapur",
  "Kollam", "Kota", "Kozhikode", "Kurnool", "Latur",
  "Lucknow", "Ludhiana", "Madurai", "Malappuram", "Mathura",
  "Mangalore", "Meerut", "Moradabad", "Mysore", "Nanded",
  "Nashik", "Nellore", "Noida", "Palakkad", "Patna",
  "Pondicherry", "Pune", "Raipur", "Rajahmundry", "Rajkot",
  "Ranchi", "Salem", "Sangli", "Shimoga", "Siliguri",
  "Solapur", "Srinagar", "Surat", "Thane", "Thiruvananthapuram",
  "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Udaipur", "Vadodara",
  "Varanasi", "Vasai-Virar", "Vijayawada", "Visakhapatnam", "Warangal",
  
  // Union Territories
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Lakshadweep", "Delhi", "Puducherry", "Jammu and Kashmir", "Ladakh"
] as const;

export type IndiaRegion = typeof INDIA_REGIONS[number];