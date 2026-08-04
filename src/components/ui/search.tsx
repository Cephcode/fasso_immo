import { router } from "expo-router";
import { useState } from "react";
import { Input } from "./input";

export default function Search() {
    const [text,setText]=useState('');
    
    return (
        <Input placeholder="Rechercher une ville, un quartier..." 
            value={text}
            onChangeText={setText}
            leftIcon="search" 
            onSubmitEditing={()=>{
            router.push({
                pathname:'/property/search/[query]',
                params: {
                    query: text,
                }
            })
        }} />
    )
}