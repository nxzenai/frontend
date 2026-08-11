"use client";

export default function Error({

    error,

}: {

    error: Error;

}) {

    return (

        <div
            className="
                rounded-xl
                border
                border-red-800
                bg-red-950/40
                p-10
                text-center
            "
        >

            <h2
                className="
                    text-2xl
                    font-bold
                    text-red-400
                "
            >

                Dataset Module Error

            </h2>

            <p
                className="
                    mt-4
                    text-slate-300
                "
            >

                {error.message}

            </p>

        </div>

    );

}