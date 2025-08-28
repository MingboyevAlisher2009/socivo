import { Helmet } from "react-helmet";

interface MetaProps {
  title?: string;
  image?: string;
  description?: string;
  isHome?: boolean;
}

const SeoHead = ({ title, image, description, isHome = false }: MetaProps) => {
  return (
    <Helmet>
      <title>{isHome ? "Socivo" : `Socivo - ${title}`}</title>
      <meta property="og:title" content={`Socivo - ${title}`} />
      <meta property="og:image" content={image || "/logo.svg"} />
      <meta
        property="og:description"
        content={
          description ||
          "A social space to post, comment, like, and chat. Join the community today!"
        }
      />
    </Helmet>
  );
};

export default SeoHead;
