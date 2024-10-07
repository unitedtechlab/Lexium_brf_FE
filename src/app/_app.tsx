import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
}

export default MyApp;

// Define and export the reportWebVitals function
export function reportWebVitals(metric: any) {
    console.log(metric);
}
