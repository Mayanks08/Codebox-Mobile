import { createSessionFromUrl, isAuthCallbackUrl } from '@/lib/auth';
import { create } from 'zustand';
import {supabase} from '../lib/supabase';

import type{Session ,User} from '@supabase/supabase-js';

interface AuthStore {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    isIntialized: boolean

    initialize :() => void 
    handleDeeplink: (url: string) => Promise<void>
    signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    session: null,
    user: null,
    isLoading: true,
    isIntialized: false,

    initialize:() => {
        if(get().isIntialized){ 
            return()=>{}
        }

        set({isIntialized:true});

        supabase.auth.getSession().then(({data:{session}})=>{
            set({
                session, 
                user: session?.user ?? null,
                 isLoading:false

            })
        })

        const {data: authListener} = supabase.auth.onAuthStateChange((_event, session)=>{
            set({
                session, 
                user: session?.user ?? null,
                 isLoading:false
            })
        }
    );
        return () => {
            authListener.subscription.unsubscribe();
        }

    },
    handleDeeplink: async(url) => {
        if(!isAuthCallbackUrl(url))
            return ;
        await createSessionFromUrl(url); },
    signOut: async () => {
       const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

}))