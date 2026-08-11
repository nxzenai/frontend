"use client";

import { useState } from "react";

import {
    Copy,
    Check,
} from "lucide-react";

interface Props {

    datasetName: string;

}

export default function CopyCodeButton({

    datasetName,

}: Props) {

    const [copied, setCopied] =
        useState(false);

    ////////////////////////////////////////////////////////
    // Copy Code
    ////////////////////////////////////////////////////////

    async function handleCopy() {

        const code = `import pandas as pd

# Load Dataset

df = pd.read_csv("${datasetName}")

# Preview

df.head()

# Dataset Information

df.info()

# Statistics

df.describe()
`;

        await navigator.clipboard.writeText(
            code
        );

        setCopied(true);

        setTimeout(() => {

            setCopied(false);

        }, 2000);

    }

    ////////////////////////////////////////////////////////
    // UI
    ////////////////////////////////////////////////////////

    return (

        <button

            onClick={handleCopy}

            className="
                flex
                items-center
                gap-2
                rounded-lg
                border
                border-blue-500/30
                bg-blue-500/10
                px-4
                py-2
                text-sm
                font-medium
                text-blue-300
                transition
                hover:bg-blue-500
                hover:text-white
            "

        >

            {

                copied

                    ? <Check size={16} />

                    : <Copy size={16} />

            }

            {

                copied

                    ? "Copied"

                    : "Copy Pandas Code"

            }

        </button>

    );

}