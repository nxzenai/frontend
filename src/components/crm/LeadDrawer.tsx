"use client";

import { useState } from "react";

import {

    X,

    Mail,

    Phone,

    Calendar,

    User,

    Briefcase,

    MessageSquare,

} from "lucide-react";

import { Lead } from "@/types/crm";

import StatusBadge from "./StatusBadge";

interface Props {

    lead: Lead;

    onClose: () => void;

    onRefresh: () => void;

}

export default function LeadDrawer({

    lead,

    onClose,

    onRefresh,

}: Props) {

    const [

        notes,

        setNotes,

    ] = useState(

        lead.notes || ""

    );

    return (

        <>

            {/* Overlay */}

            <div

                className="fixed inset-0 z-40 bg-black/50"

                onClick={onClose}

            />

            {/* Drawer */}

            <div

                className="

                    fixed

                    right-0

                    top-0

                    z-50

                    flex

                    h-screen

                    w-[560px]

                    flex-col

                    border-l

                    border-slate-800

                    bg-[#020617]

                    shadow-2xl

                "

            >
                                {/* Header */}

                <div

                    className="

                        flex

                        items-center

                        justify-between

                        border-b

                        border-slate-800

                        px-6

                        py-5

                    "

                >

                    <div>

                        <h2

                            className="text-2xl font-bold"

                        >

                            {lead.name}

                        </h2>

                        <p

                            className="mt-1 text-slate-400"

                        >

                            Lead Details

                        </p>

                    </div>

                    <button

                        onClick={onClose}

                        className="rounded-lg p-2 hover:bg-slate-800"

                    >

                        <X size={22} />

                    </button>

                </div>

                <div

                    className="flex-1 overflow-y-auto p-6"

                >
                                    {/* Status */}

                    <div className="mb-8 flex gap-3">

                        <StatusBadge

                            value={lead.status}

                            type="status"

                        />

                        <StatusBadge

                            value={lead.priority}

                            type="priority"

                        />

                    </div>

                    {/* Contact */}

                    <div

                        className="

                            rounded-xl

                            border

                            border-slate-800

                            bg-slate-900

                            p-5

                        "

                    >

                        <h3

                            className="mb-5 text-lg font-semibold"

                        >

                            Contact Information

                        </h3>

                        <div className="space-y-4">

                            <div className="flex gap-3">

                                <Mail

                                    size={18}

                                    className="text-blue-400"

                                />

                                <div>

                                    <p className="text-sm text-slate-400">

                                        Email

                                    </p>

                                    <p>{lead.email}</p>

                                </div>

                            </div>

                            <div className="flex gap-3">

                                <Phone

                                    size={18}

                                    className="text-green-400"

                                />

                                <div>

                                    <p className="text-sm text-slate-400">

                                        Phone

                                    </p>

                                    <p>{lead.phone}</p>

                                </div>

                            </div>

                        </div>

                    </div>
                                        <div

                        className="

                            mt-6

                            rounded-xl

                            border

                            border-slate-800

                            bg-slate-900

                            p-5

                        "

                    >

                        <h3

                            className="mb-5 text-lg font-semibold"

                        >

                            Lead Information

                        </h3>

                        <div className="space-y-5">

                            <div className="flex gap-3">

                                <Briefcase

                                    size={18}

                                    className="text-purple-400"

                                />

                                <div>

                                    <p className="text-sm text-slate-400">

                                        Profession

                                    </p>

                                    <p>

                                        {lead.profession}

                                    </p>

                                </div>

                            </div>

                            <div className="flex gap-3">

                                <User

                                    size={18}

                                    className="text-blue-400"

                                />

                                <div>

                                    <p className="text-sm text-slate-400">

                                        Program

                                    </p>

                                    <p>

                                        {lead.program_interest}

                                    </p>

                                </div>

                            </div>

                            <div className="flex gap-3">

                                <Calendar

                                    size={18}

                                    className="text-green-400"

                                />

                                <div>

                                    <p className="text-sm text-slate-400">

                                        Demo Date

                                    </p>

                                    <p>

                                        {lead.preferred_demo_date}

                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>
                                        <div

                        className="

                            mt-6

                            rounded-xl

                            border

                            border-slate-800

                            bg-slate-900

                            p-5

                        "

                    >

                        <h3

                            className="mb-5 text-lg font-semibold"

                        >

                            Notes

                        </h3>

                        <textarea

                            value={notes}

                            onChange={(e)=>

                                setNotes(

                                    e.target.value

                                )

                            }

                            rows={6}

                            className="

                                w-full

                                rounded-xl

                                border

                                border-slate-700

                                bg-slate-950

                                p-4

                                outline-none

                            "

                        />

                    </div>
                                    </div>

                {/* Footer */}

                <div

                    className="

                        border-t

                        border-slate-800

                        p-5

                    "

                >

                    <div className="flex gap-3">

                        <button

                            className="

                                flex-1

                                rounded-xl

                                bg-blue-600

                                py-3

                                font-semibold

                                transition

                                hover:bg-blue-700

                            "

                        >

                            Save Changes

                        </button>

                        <button

                            className="

                                rounded-xl

                                border

                                border-slate-700

                                px-6

                                transition

                                hover:bg-slate-800

                            "

                            onClick={onClose}

                        >

                            Close

                        </button>

                    </div>

                </div>

            </div>

        </>

    );

}