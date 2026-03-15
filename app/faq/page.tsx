"use client" ;
import React from "react";

export default function FAQ() {
const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    const faqs = [
        {
            question: "What is Lorem Ipsum?",
            answer: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
            question: "What is Lorem Ipsum?",
            answer: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
            question: "What is Lorem Ipsum?",
            answer: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
        {
            question: "What is Lorem Ipsum?",
            answer: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
                * { font-family: 'Poppins', sans-serif; }
            `}</style>
            <div className="max-w-xl mx-auto flex flex-col items-center justify-center px-4 md:px-0 mt-16">
                <p className="text-indigo-600 text-sm font-medium">FAQ's</p>
                <h1 className="text-3xl font-semibold text-center">Looking for answer?</h1>
                <p className="text-sm text-slate-500 mt-2 pb-8 text-center">
                    Ship Beautiful Frontends Without the Overhead — Customizable, Scalable and Developer-Friendly UI Components.
                </p>
                {faqs.map((faq, index) => (
                    <div 
                        className="border-b border-slate-200 py-4 cursor-pointer w-full" 
                        key={index} 
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium">{faq.question}</h3>
                            <svg 
                                width="18" 
                                height="18" 
                                viewBox="0 0 18 18" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`${openIndex === index ? "rotate-180" : ""} transition-all duration-500 ease-in-out`}
                            >
                                <path 
                                    d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2" 
                                    stroke="#1D293D" 
                                    strokeWidth="1.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />
                            </svg>
                        </div>
                        <p className={`text-sm text-slate-500 transition-all duration-500 ease-in-out max-w-md ${
                            openIndex === index 
                                ? "opacity-100 max-h-[300px] translate-y-0 pt-4" 
                                : "opacity-0 max-h-0 -translate-y-2"
                        }`}>
                            {faq.answer}
                        </p>
                    </div>
                ))}
            </div>
        </>
    );
}