import SeoHead from "@/components/hamlet";
import NotificationsPane from "./components/notifications-pane";
import PostsFeed from "./components/posts-feed";
import SuggestedUsers from "./components/suggested-users";

export default function Home() {
  return (
    <>
      <SeoHead isHome />
      <div className="container mx-auto py-8">
        <main className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-3 gap-8">
          <aside className="hidden lg:block md:col-span-1">
            <NotificationsPane />
          </aside>

          <section className="col-span-1 md:col-span-2">
            <PostsFeed />
          </section>

          <aside className="hidden md:block md:col-span-1">
            <SuggestedUsers />
          </aside>
        </main>
      </div>
    </>
  );
}
