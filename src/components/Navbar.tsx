"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navigation = [
  ["Home", "/"], ["Platform", "/platform"], ["Solutions", "/solutions"],
  ["Training", "/training"], ["Industries", "/industries"], ["Contact", "/contact"],
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[.07] bg-[#050814]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[66px] w-full max-w-7xl items-center gap-5 px-5 md:h-[76px] md:px-8">
        <Link href="/" aria-label="NxZenAI home" className="focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">
          <Image src="/nxzenai-navbar-logo-v2.png" width={2172} height={724} priority alt="NxZenAI" className="h-[42px] w-[140px] shrink-0 object-contain object-left md:h-[46px] md:w-[170px]" />
        </Link>
        <nav aria-label="Main navigation" className="ml-auto hidden items-center gap-6 xl:flex">
          {navigation.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`text-sm font-medium transition-colors duration-200 hover:text-cyan-100 ${pathname === href ? "text-cyan-300" : "text-slate-300"}`}>{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-2.5 xl:flex">
          <Link href="/contact" className="rounded-[9px] bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200">Book Consultation</Link>
          <Link href="/login" className="rounded-[9px] border border-white/15 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-300/50 hover:text-cyan-100">Explore AI Studio</Link>
        </div>
        <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="marketing-mobile-nav" aria-label={open ? "Close navigation" : "Open navigation"} className="ml-auto rounded-lg border border-white/10 p-2 text-slate-100 transition-colors hover:border-cyan-300/50 xl:hidden">{open ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
      <div id="marketing-mobile-nav" hidden={!open} className="border-t border-white/[.07] bg-[#070b16] xl:hidden">
        <nav aria-label="Mobile navigation" className="mx-auto grid w-full max-w-7xl gap-1 px-5 py-4 md:px-8">
          {navigation.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={pathname === href ? "page" : undefined} className={`rounded-lg px-4 py-3 text-sm font-medium ${pathname === href ? "bg-cyan-300/10 text-cyan-200" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>{label}</Link>)}
          <div className="mt-3 grid grid-cols-1 gap-2 sm:max-w-md sm:grid-cols-2"><Link href="/contact" onClick={() => setOpen(false)} className="rounded-lg bg-cyan-300 px-3 py-3 text-center text-sm font-bold text-slate-950">Book Consultation</Link><Link href="/login" onClick={() => setOpen(false)} className="rounded-lg border border-white/15 px-3 py-3 text-center text-sm font-semibold text-white">Explore AI Studio</Link></div>
        </nav>
      </div>
    </header>
  );
}
