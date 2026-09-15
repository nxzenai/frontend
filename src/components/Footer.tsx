import Image from "next/image";
import Link from "next/link";

const columns = [
  { title: "Platform", links: [["NxZenAI Studio", "/platform"], ["AI Capabilities", "/platform#capabilities"], ["Explore Studio", "/login"]] },
  { title: "Solutions", links: [["AI Consulting", "/solutions"], ["AI Automation", "/solutions"], ["Enterprise AI", "/solutions"]] },
  { title: "Training", links: [["AI Programs", "/training"], ["Curriculum", "/training#curriculum"], ["Industry Projects", "/training#projects"]] },
  { title: "Company", links: [["Industries", "/industries"], ["Contact", "/contact"], ["Book Consultation", "/contact"]] },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-white/[.07] bg-[#040711]">
      <div className="mk-container py-14">
        <div className="grid gap-10 md:grid-cols-[1.25fr_2.75fr]">
          <div><Link href="/" aria-label="NxZenAI home" className="inline-block focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"><Image src="/nxzenai-navbar-logo-v2.png" width={2172} height={724} alt="NxZenAI" className="h-[54px] w-[160px] object-contain object-left sm:h-[58px] sm:w-[190px]" /></Link><p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">Building practical AI capabilities for people, teams, and organizations.</p><p className="mt-4 text-[10px] font-semibold tracking-[.18em] text-cyan-300/80">NEXT GENERATION ANY INTELLIGENCE</p></div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">{columns.map(column => <div key={column.title}><h3 className="text-sm font-semibold text-white">{column.title}</h3><div className="mt-4 grid gap-2.5">{column.links.map(([label, href]) => <Link key={label} href={href} className="text-sm text-slate-400 hover:text-cyan-200">{label}</Link>)}</div></div>)}</div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/[.07] pt-6 text-xs text-slate-500 sm:flex-row"><span>© {new Date().getFullYear()} NxZenAI. All rights reserved.</span><span>Learn AI. Build with AI. Solve with AI. Scale AI.</span></div>
      </div>
    </footer>
  );
}
