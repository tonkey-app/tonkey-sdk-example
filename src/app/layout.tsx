'use client';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from '@apollo/client';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const BASE_URL = process.env.NEXT_PUBLIC_GRAPHQL_URI;
const httpLink = new HttpLink({ uri: BASE_URL });
const namedLink = new ApolloLink((operation, forward) => {
  operation.setContext(() => ({
    uri: `${BASE_URL}?${operation.operationName}`,
  }));
  return forward ? forward(operation) : null;
});
const client = new ApolloClient({
  link: ApolloLink.from([namedLink, httpLink]),
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Examples</title>
      </head>
      <body className={inter.className}>
        <Head>
          <title>Examples</title>
        </Head>
        <ApolloProvider client={client}>{children}</ApolloProvider>
      </body>
    </html>
  );
}
