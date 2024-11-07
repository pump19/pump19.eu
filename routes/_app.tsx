import { type PageProps } from "$fresh/server.ts";

import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";
import { SessionState } from "../plugins/oauth.ts";

export default function App({ Component, route, state }: PageProps) {
  const session = (state as SessionState).session;

  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Pump19</title>
        <link rel="stylesheet" href="/styles.css" />
        <link
          rel="icon"
          type="image/gif"
          href="data:image/gif;base64,R0lGODlhEAAQAOMJAAABACcgFkE2IllMMnJiQop3Uf92AP+pAP/MBv///////////////////////////yH5BAEKAA8ALAAAAAAQABAAAARf8MkHqrVzAjGIJ0UIZNvQfZ4olSeajhQ3CEFN0HVRyYNxGAGCD6gDBAScA+IQGCiZRRpnaBoKokeTidfRxTgfpODj3cgIrZP3a6q5QeuYKVWgw9jdkIqEVO8zFBcYEhEAOw=="
        />
      </head>
      <body class="flex min-h-screen flex-col bg-gray font-serif text-white-dim">
        <Header session={session} path={route} />
        <main class="container flex-grow p-4">
          <Component />
        </main>
        <Footer />
      </body>
    </html>
  );
}
