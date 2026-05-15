"use client" ;
import React from "react";

export default function FAQ() {
const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    const faqs = [
        {
            question: "¿Qué es SpotiFake?",
            answer: "SpotiFake es una plataforma de streaming de música inspirada en Spotify, desarrollada como proyecto educativo. Permite explorar artistas, álbumes, canciones y crear listas de reproducción personalizadas, todo con un diseño fresco y amigable.",
        },
        {
            question: "¿Necesito una cuenta para escuchar música?",
            answer: "Puedes navegar por el catálogo sin registrarte, pero para disfrutar de funciones como guardar canciones en favoritos, crear listas de reproducción o acceder a tu perfil, necesitarás crear una cuenta gratuita. El registro es rápido y sencillo.",
        },
        {
            question: "¿Cómo creo una lista de reproducción?",
            answer: "Una vez que hayas iniciado sesión, ve a la sección «Playlists» desde el menú de navegación y haz clic en el botón «Nueva playlist». Ponle un nombre, añade una portada si quieres y empieza a agregar canciones desde cualquier álbum o artista.",
        },
        {
            question: "¿Cómo añado canciones a mis favoritos?",
            answer: "En cualquier canción del reproductor o del listado de un álbum verás un icono de corazón. Dale clic para guardarla en tus «Me gusta». Puedes acceder a todas tus canciones favoritas desde la sección «Liked Songs» dentro de Playlists.",
        },
        {
            question: "¿Puedo cambiar mi foto de perfil o mi nombre?",
            answer: "Sí. Entra en tu perfil haciendo clic en tu avatar en la barra de navegación y selecciona «Configuración» o accede directamente a la página de usuario. Desde allí podrás actualizar tu nombre y subir una nueva foto de perfil.",
        },
        {
            question: "He olvidado mi contraseña, ¿qué hago?",
            answer: "En la página de inicio de sesión encontrarás el enlace «¿Has olvidado tu contraseña?». Introduce tu correo electrónico y te enviaremos un enlace para restablecerla. Comprueba también la carpeta de spam por si acaso.",
        },
        {
            question: "¿Puedo eliminar mi cuenta?",
            answer: "Sí, puedes eliminar tu cuenta de forma permanente desde la sección de Configuración, en el apartado «Zona de peligro». Ten en cuenta que esta acción es irreversible: se borrarán todos tus datos, playlists y favoritos.",
        },
        {
            question: "¿Por qué algunas canciones no se reproducen correctamente?",
            answer: "SpotiFake es un proyecto en desarrollo, por lo que algunos archivos de audio pueden no estar disponibles todavía. Si tienes problemas de reproducción, prueba a refrescar la página o comprueba tu conexión a Internet. Si el problema persiste, contáctanos.",
        },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
                * { font-family: 'Poppins', sans-serif; }
            `}</style>
            <div className="max-w-xl mx-auto flex flex-col items-center justify-center px-4 md:px-0 mt-16 mb-16">
                <p className="text-sm font-medium" style={{color: "#1CF094"}}>Preguntas frecuentes</p>
                <h1 className="text-3xl font-semibold text-center">¿Tienes alguna duda?</h1>
                <p className="text-sm text-slate-500 mt-2 pb-8 text-center">
                    Aquí encontrarás respuesta a las preguntas más habituales sobre SpotiFake. Si no encuentras lo que buscas, no dudes en contactarnos.
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
                                    stroke="#c2e18f" 
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