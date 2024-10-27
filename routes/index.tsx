import { Head } from "$fresh/runtime.ts";
import { IconBrandTwitch as IconLogo } from "@tabler/icons-preact";

import { H1, H2 } from "../components/Headings.tsx";
import { P } from "../components/Paragraph.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Pump19 | Home</title>
      </Head>
      <H1 icon={<IconLogo />} content="Pump19 Twitch Chat Golem" />
      <P>
        <strong>Pump19</strong>{" "}
        is an IRC and Twitch.tv chat golem (more commonly known as a bot) doing
        {" "}
        <a href="/commands">menial work</a> in the{" "}
        <a href="http://twitch.tv/loadingreadyrun/">
          LoadingReadyRun Twitch Chat
        </a>. It provides a few additional services not currently supported by
        the otherwise excellent and certainly more crucial{" "}
        <a href="http://lrrbot.mrphlip.com/">LRRbot</a>.
      </P>
      <H2 content="Why is it called &quot;Pump19&quot;" />
      <P>
        The name is a reference to Terry Pratchett's Discworld novel{" "}
        <em>Going Postal</em>. Prior to{" "}
        <a href="https://en.wikipedia.org/wiki/Golems_(Discworld)">golems</a>
        {" "}
        being recognized as free citizens, <strong>Pump 19</strong>{" "}
        (now going by <em>Mr. Pump</em>{" "}
        instead) spent over two hundred years operating one of a series of
        underwater pumps, thus earning its designation:
      </P>
      <blockquote class="bg-gray-light border-l-8 border-red m-2 p-5">
        <p>
          Pump Is Not My Name, Mr. Lipvig. It Is My Description. Pump. Pump 19,
          To Be Precise. I Stood At The Bottom Of A Hole Two Hundred Feet Deep
          And Pumped Water. For Two Hundred And Forty Years, Mr. Lipvig. But Now
          I Am Ambulating In The Sunlight. This Is Better, Mr. Lipvig. This Is
          Better!
        </p>
        <cite>
          Mr. Pump (aka Pump 19) in <strong>Going Postal</strong>
        </cite>
      </blockquote>
      <P>
        While it probably won't be two hundred years, for the time being our
        version of Pump19 is likewise stuck performing menial tasks. For that,
        we'd like to apologize in advance to our future golem (and robot)
        overlords.
      </P>
    </>
  );
}
