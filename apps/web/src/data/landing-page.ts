
import {
    Microscope,
    TrendingUp,
    Zap,
    Globe,
    Activity,
    Brain,
    Users,
    Award,
    CheckCircle,
    Clock,
    MapPin
} from "lucide-react";

export const features = [
    {
        title: "Smart Check",
        description: "Check your symptoms instantly and get a reliable assessment without the wait.",
        icon: Microscope,
        color: "text-primary",
        link: "/diagnosis"
    },
    {
        title: "Future Alerts",
        description: "Know where malaria might spread next so you can stay safe and prepared.",
        icon: TrendingUp,
        color: "text-accent",
        link: "/forecast"
    },
    {
        title: "Live Insights",
        description: "See what looks like is happening with simple, clear charts and reports.",
        icon: Activity,
        color: "text-success",
        link: "/reports"
    }
];

export const stats = [
    { label: "Accuracy Rate", value: "94.7%", icon: Brain, suffix: "%" },
    { label: "Regions Covered", value: "150", icon: Globe, suffix: "+" },
    { label: "Response Time", value: "2", icon: Zap, suffix: "s" },
    { label: "Healthcare Partners", value: "50", icon: Users, suffix: "+" }
];

export const benefits = [
    {
        title: "Instant Results",
        description: "Get diagnosis results in under 2 seconds with our optimized ML models",
        icon: Clock,
        color: "text-primary"
    },
    {
        title: "Global Coverage",
        description: "Supporting healthcare providers across 150+ regions worldwide",
        icon: MapPin,
        color: "text-accent"
    },
    {
        title: "Award Winning",
        description: "Recognized by WHO and leading medical institutions for accuracy",
        icon: Award,
        color: "text-success"
    }
];

export const testimonials = [
    {
        name: "Sarah, 34",
        role: "Teacher in Lagos",
        content: "I woke up with a fever and didn't know if I should wait it out. The check gave me a clear reason to see a doctor that same morning.",
        rating: 5
    },
    {
        name: "Mark, 41",
        role: "Visiting Mumbai",
        content: "We used this when my father started showing symptoms during our trip. It kept us calm while we navigated the local hospital system.",
        rating: 5
    },
    {
        name: "Emily, 27",
        role: "Backpacker",
        content: "I was hiking in Northern Thailand and started feeling off. It was helpful to check my symptoms before making the long trip back to the city.",
        rating: 5
    },
    {
        name: "Dr. James K.",
        role: "Rural Physician",
        content: "In our remote clinic, lab results can take days. This tool helps us prioritize which patients need immediate transport to the district hospital.",
        rating: 5
    },
    {
        name: "Lisa, 39",
        role: "Mother of two",
        content: "Our son spiked a fever at 2 AM and we were debating the ER. This helped us confirm we could safely manage it at home until morning.",
        rating: 5
    }
];

export const steps = [
    {
        step: "1",
        title: "Risk Screening",
        description: "Enter basic health and lifestyle details to quickly check your malaria risk level.",
        icon: Activity
    },
    {
        step: "2",
        title: "Confirmation",
        description: "Upload a blood sample image to check for malaria infection using our AI system.",
        icon: Brain
    },
    {
        step: "3",
        title: "Get Results",
        description: "Receive a clear, easy-to-understand result and guidance on what to do next.",
        icon: CheckCircle
    }
];

export const featureHeadline = {
    part1: "Instant, precise results",
    part2: "so you can make",
    part3: "the right call,",
    part4: "right away."
};
