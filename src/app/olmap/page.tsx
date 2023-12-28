"use client"
// react
import React, {useState, useEffect, useRef} from 'react';
import MapWrapper from "@/components/MapWrapper";

export default function  OlMap() {
    return (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <main style={{ width: "100%" }}>
            <MapWrapper/>
            </main>
        </div>
    )
}