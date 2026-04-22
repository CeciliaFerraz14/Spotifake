"use client";
import Link from "next/link";

const eqCss = `
  .eq-wrap {
    display: flex;
    align-items: flex-end;
    gap: 2.5px;
    height: 28px;
    padding-bottom: 1px;
  }
  .eq-bar {
    width: 3px;
    border-radius: 3px 3px 1px 1px;
    background: #0d4a2c;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  @keyframes eq1 {
    0%,100%{ height:5px  } 20%{ height:26px } 55%{ height:10px } 80%{ height:18px }
  }
  @keyframes eq2 {
    0%,100%{ height:18px } 30%{ height:6px  } 60%{ height:28px } 85%{ height:8px  }
  }
  @keyframes eq3 {
    0%,100%{ height:10px } 15%{ height:30px } 50%{ height:7px  } 75%{ height:24px }
  }
  @keyframes eq4 {
    0%,100%{ height:22px } 25%{ height:8px  } 55%{ height:32px } 80%{ height:12px }
  }
  @keyframes eq5 {
    0%,100%{ height:7px  } 35%{ height:20px } 65%{ height:28px } 90%{ height:6px  }
  }
  @keyframes eq6 {
    0%,100%{ height:16px } 20%{ height:6px  } 50%{ height:26px } 70%{ height:10px }
  }
  @keyframes eq7 {
    0%,100%{ height:8px  } 40%{ height:30px } 70%{ height:14px } 90%{ height:22px }
  }
`;

const bars = [
  { anim: "eq1", dur: "0.72s", delay: "0s"     },
  { anim: "eq2", dur: "0.54s", delay: "0.08s"  },
  { anim: "eq3", dur: "0.88s", delay: "0.16s"  },
  { anim: "eq4", dur: "0.62s", delay: "0.04s"  },
  { anim: "eq5", dur: "0.50s", delay: "0.22s"  },
  { anim: "eq6", dur: "0.78s", delay: "0.12s"  },
  { anim: "eq7", dur: "0.66s", delay: "0.30s"  },
  { anim: "eq1", dur: "0.60s", delay: "0.18s"  },
  { anim: "eq3", dur: "0.74s", delay: "0.06s"  },
  { anim: "eq5", dur: "0.84s", delay: "0.24s"  },
  { anim: "eq2", dur: "0.58s", delay: "0.34s"  },
  { anim: "eq6", dur: "0.70s", delay: "0.10s"  },
  { anim: "eq4", dur: "0.52s", delay: "0.28s"  },
  { anim: "eq7", dur: "0.80s", delay: "0.02s"  },
  { anim: "eq1", dur: "0.64s", delay: "0.20s"  },
  { anim: "eq3", dur: "0.56s", delay: "0.38s"  },
  { anim: "eq5", dur: "0.76s", delay: "0.14s"  },
  { anim: "eq2", dur: "0.68s", delay: "0.32s"  },
];

export default function Navbar() {
  return (
    <>
      <style>{eqCss}</style>
      <nav className="w-full bg-[#1CF094]/70 backdrop-blur-md text-white shadow-md">
        <div className="w-full px-4">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Izquierda: ondas + nombre */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="eq-wrap">
                {bars.map((b, i) => (
                  <div
                    key={i}
                    className="eq-bar"
                    style={{
                      animation: `${b.anim} ${b.dur} ${b.delay} ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
              <Link href="/" className="text-xl font-bold text-gray-800 leading-none">
                Ceci, Jess, Isa
              </Link>
            </div>

            {/* Centro: links */}
            <div className="hidden lg:flex flex-1 justify-center">
              <div className="hidden lg:flex items-center space-x-4">
                <Link href="/inicio" className="rounded-md bg-black/10 px-3 py-2 text-sm font-medium text-gray-900">
                  Inicio
                </Link>
                <Link href="/usuario" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-black/10">
                  Usuario
                </Link>
                <Link href="/discos" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-black/10">
                  Discos
                </Link>
                <Link href="/faq" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-black/10">
                  FAQ
                </Link>
              </div>
            </div>

            {/* Derecha: buscador */}
            <div className="hidden md:flex items-center">
              <form className="flex items-center border pl-4 gap-2 bg-white border-gray-500/30 h-[46px] rounded-full overflow-hidden max-w-xs w-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#6B7280" className="flex-shrink-0">
                  <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  type="search"
                  placeholder="Buscar..."
                  className="w-full h-full outline-none text-sm text-gray-500 bg-transparent placeholder-gray-400 pr-2"
                />
                <button type="submit" className="bg-[#7d5a50] px-4 h-full text-sm text-white hover:opacity-90 transition">
                  Search
                </button>
              </form>
            </div>

          </div>
        </div>
      </nav>
    </>
  );
}
