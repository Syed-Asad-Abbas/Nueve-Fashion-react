import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import { createRoot } from "react-dom/client";
import {
  products,
  asset,
  money,
  filterProducts,
  collectionTabs,
  audienceTabs,
  calculateTotals,
  mobileProducts,
} from "./catalog";
import "./styles.css";
import "./mobile.css";

const Store = createContext();
function useMobile() {
  const [mobile, setMobile] = useState(
    () => window.matchMedia("(max-width: 680px)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width: 680px)");
    const changed = () => setMobile(media.matches);
    media.addEventListener("change", changed);
    return () => media.removeEventListener("change", changed);
  }, []);
  return mobile;
}
function useSaved(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
function Icon({ name }) {
  const paths = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="7.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 22v-3a8 8 0 0 1 16 0v3" />
      </>
    ),
    cart: (
      <>
        <path d="M2 3h3l2.5 12h11L21 7H6" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    arrow: <path d="M5 19 19 5M5 5h14v14" />,
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    close: <path d="m5 5 14 14M19 5 5 19" />,
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      {paths[name] || paths.arrow}
    </svg>
  );
}
function Link({ to, children, ...props }) {
  const { navigate } = useContext(Store);
  return (
    <a
      href={to}
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        if (
          e.defaultPrevented ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey ||
          e.altKey ||
          e.button !== 0
        )
          return;
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
const collectionLink = (filter) =>
  `/collections/all${filter === "All" ? "" : `?filter=${encodeURIComponent(filter)}`}`;
function Brand({ footer = false }) {
  return footer ? (
    <Link to="/" className="footer-wordmark" aria-label="Nueve home">
      <svg
        className="footer-wordmark__symbol"
        viewBox="0 0 42 30"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="ReactBrand">
            <path d="M0 14 10 1h7l10 28h-9L10 8v21H0zm29-13h13v13L32 29h-5V1z" />
          </clipPath>
        </defs>
        <image
          href={asset("footer-models.webp")}
          width="42"
          height="30"
          preserveAspectRatio="xMidYMin slice"
          clipPath="url(#ReactBrand)"
        />
      </svg>
      <span>ueve</span>
    </Link>
  ) : (
    <Link to="/" className="site-header__brand">
      <svg className="brand-mark" viewBox="0 0 42 30" aria-hidden="true">
        <path
          fill="currentColor"
          d="M0 14 10 1h7l10 28h-9L10 8v21H0zm29-13h13v13L32 29h-5V1z"
        />
      </svg>
      <span>Nueve.</span>
    </Link>
  );
}
function Header() {
  const { cart } = useContext(Store);
  const [search, setSearch] = useState(false),
    [menu, setMenu] = useState(false);
  const { navigate, route } = useContext(Store);
  useEffect(() => {
    setSearch(false);
    setMenu(false);
  }, [route]);
  const links = ["Women", "Men", "Accessories", "New Arrival", "Sale"];
  return (
    <header className="site-header page-width">
      <button
        className="icon-button mobile-toggle"
        aria-label="Open menu"
        aria-expanded={menu}
        onClick={() => setMenu(!menu)}
      >
        <Icon name="menu" />
      </button>
      <Brand />
      <nav
        className={`site-header__nav ${menu ? "is-open" : ""}`}
        aria-label="Main navigation"
      >
        {links.map((x) => (
          <Link key={x} to={collectionLink(x)}>
            {x}
          </Link>
        ))}
      </nav>
      <div className="site-header__actions">
        <button
          className="icon-button search-toggle"
          aria-label="Search products"
          aria-expanded={search}
          onClick={() => setSearch(!search)}
        >
          <Icon name="search" />
        </button>
        <Link className="icon-button" to="/account" aria-label="Account">
          <Icon name="user" />
        </Link>
        <Link
          className="icon-button cart-link"
          to="/cart"
          aria-label={`Cart, ${cart.reduce((n, x) => n + x.quantity, 0)} items`}
        >
          <Icon name="cart" />
          {cart.length > 0 && (
            <span className="cart-count">
              {cart.reduce((n, x) => n + x.quantity, 0)}
            </span>
          )}
        </Link>
      </div>
      {search && (
        <form
          className="header-search__panel"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(
              `/search?q=${encodeURIComponent(new FormData(e.currentTarget).get("q"))}`,
            );
          }}
        >
          <label htmlFor="header-query">Find your next essential</label>
          <div className="search-row">
            <input
              autoFocus
              required
              id="header-query"
              name="q"
              placeholder="Search products, styles, and collections"
            />
            <button className="button button--dark">Search</button>
            <button
              type="button"
              className="icon-button"
              aria-label="Close search"
              onClick={() => setSearch(false)}
            >
              <Icon name="close" />
            </button>
          </div>
        </form>
      )}
    </header>
  );
}
function Tabs({ tabs, value, onChange, audience = false }) {
  return (
    <div
      className={`catalog-tabs catalog-tabs--${audience ? "audience" : "collection"}`}
      aria-label="Filter products"
    >
      {tabs.map((x, i) => (
        <button
          key={x}
          className={`catalog-tab ${value === x ? "is-active" : ""}`}
          aria-pressed={value === x}
          onClick={() => onChange(x)}
        >
          {audience && (
            <span className="catalog-tab__art">
              <img
                src={asset(
                  ["filter-all.webp", "filter-men.webp", "filter-women.webp"][
                    i
                  ],
                )}
                alt=""
              />
            </span>
          )}
          {x}
        </button>
      ))}
    </div>
  );
}
function mobileMoney(price) {
  return money(price);
}
function ProductCard({ product: p, showcase = false }) {
  const mobile = useMobile();
  const { add } = useContext(Store);
  return (
    <article className="product-card">
      <Link className="product-card__image" to={`/products/${p.id}`}>
        <img
          src={asset(
            mobile && p.id === "navy-mesh"
              ? "mobile-green-shirt.webp"
              : p.cardImage || p.image,
          )}
          alt={p.name}
          loading="lazy"
        />
      </Link>
      {showcase && (
        <Link
          className="product-card__showcase-link"
          to={`/products/${p.id}`}
          aria-label={`View ${p.name}`}
        >
          <Icon name="arrow" />
        </Link>
      )}
      <div className="product-card__info">
        <div>
          <h3>
            <Link to={`/products/${p.id}`}>
              {mobile && showcase ? "COTTON MESH SHIRT" : p.name}
            </Link>
          </h3>
          <p>
            {mobile
              ? showcase
                ? `$${p.price}`
                : `${p.price}$`
              : money(p.price)}
            {p.compare && (
              <s className="product-card__compare">
                {mobile ? `$${p.compare}` : money(p.compare)}
              </s>
            )}
          </p>
        </div>
        <button
          className="product-card__action"
          aria-label={`Add ${p.name} to cart`}
          onClick={() => add(p, p.sizes[0], p.colors[0], 1)}
        >
          <Icon name="cart" />
        </button>
      </div>
      {showcase && (
        <div className="product-card__sizes">
          {p.sizes.map((size) => (
            <Link
              key={size}
              to={`/products/${p.id}?size=${encodeURIComponent(size)}`}
            >
              {size}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
function HeroRing({ front = false }) {
  return (
    <svg
      className={`hero-ring hero-ring--${front ? "front" : "rear"}`}
      viewBox="0 0 1400 670"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`ring-${front}`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="229.5"
          x2="0"
          y2="540.5"
        >
          <stop stopColor="#4A8DFF" />
          <stop offset="1" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      {front ? (
        <path
          d="M713.7472243574 385 A343.2527756426 155.4999993274 0 0 1 1400.2527756426 385"
          transform="rotate(17.61 1057 385)"
          fill="none"
          stroke={`url(#ring-${front})`}
          strokeWidth="11"
        />
      ) : (
        <ellipse
          cx="1057"
          cy="385"
          rx="343.2527756426"
          ry="155.4999993274"
          transform="rotate(17.61 1057 385)"
          fill="none"
          stroke={`url(#ring-${front})`}
          strokeWidth="11"
        />
      )}
    </svg>
  );
}
function Home() {
  const mobile = useMobile();
  const [trending, setTrending] = useState("All Collection"),
    [collection, setCollection] = useState("All");
  const picks = filterProducts(
    mobile && trending !== "Men Collection"
      ? [0, 1, 2, 6, 7, 8].map((i, index) => ({
          ...mobileProducts[i],
          cardImage: `mobile-home-card-${index + 1}.webp`,
        }))
      : products.filter((p) => !p.showcase && !p.detail && !p.mobileOnly),
    trending,
  );
  const stories = filterProducts(
    products.filter((p) => p.showcase),
    collection,
  ).slice(0, 3);
  return (
    <>
      <section className="hero">
        <div className="hero__content">
          <h1>
            <span className="hero__heading-line">EFFORTLESS STYLE</span>
            <br />
            <span className="hero__heading-line">TIMELESS ELEGANCE.</span>
          </h1>
          <p>
            <span aria-hidden="true">↘</span>Discover timeless essentials
            designed for modern living.From crisp tailoring to cozy textures,
            elevate your everyday.
          </p>
          <Link
            className="button button--dark hero__button"
            to="/collections/all"
          >
            Start Shopping <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="hero__media">
          <HeroRing />
          <img
            className="hero__model hero__model--grey"
            src={asset("hero-model-back.png")}
            alt="Grey tailored suit"
          />
          <img
            className="hero__model hero__model--black"
            src={asset("hero-model-front.png")}
            alt="Black relaxed suit"
          />
          <HeroRing front />
        </div>
      </section>
      <section className="section page-width">
        <div className="section-heading">
          <h2>
            {mobile ? "Curated for You" : "Curated For You"} <span>↘</span>
          </h2>
          <p>
            Buy the fashion you desire to elevate your style and look
            effortlessly cool.
          </p>
        </div>
        <div className="category-grid">
          {[
            ["women", "Women’s Edit", "Explore", "Women"],
            ["bag", "Minimal Accents", "Browse", "Accessories"],
            ["sale", "Limited-Time Offers!", "Grab yours", "Sale"],
            ["men", "Men’s Essentials", "Shop Now", "Men"],
          ].map(([art, title, caption, filter]) => (
            <Link
              key={art}
              className={`category-tile category-tile--${art}`}
              to={collectionLink(filter)}
            >
              <img src={asset(`category-${art}.webp`)} alt="" />
              <span className="category-tile__text">
                <strong>{title}</strong>
                <span>{caption}</span>
              </span>
              <span className="category-tile__arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="section page-width featured-products">
        <div className="section-heading">
          <h2>
            Trending Now <span>↘</span>
          </h2>
          <Tabs
            tabs={audienceTabs}
            value={trending}
            onChange={setTrending}
            audience
          />
        </div>
        <div className="product-grid">
          {picks.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="section__footer">
          <Link className="button button--dark" to={collectionLink(trending)}>
            View More ↗
          </Link>
        </div>
      </section>
      <section className="section page-width collection-showcase">
        <div className="section-heading">
          <h2>
            Our Collection
            <br />
            For You <span>↘</span>
          </h2>
          <Tabs
            tabs={collectionTabs}
            value={collection}
            onChange={setCollection}
          />
        </div>
        <div className="product-grid showcase-grid">
          {stories.map((p) => (
            <ProductCard key={p.id} product={p} showcase />
          ))}
        </div>
        <div className="section__footer">
          <Link className="button button--dark" to={collectionLink(collection)}>
            View More ↗
          </Link>
        </div>
      </section>
      <Testimonials />
      <section className="section page-width editorial editorial--promotions">
        <div className="editorial__grid">
          {[
            ["bags-color.webp", "Modern quality & mind refreshing color bag"],
            ["bags-beauty.webp", "Latest fashion & beauty leather bag for you"],
          ].map(([img, title]) => (
            <Link
              className="editorial-card"
              to={collectionLink("Accessories")}
              key={img}
            >
              <img src={asset(img)} alt="Leather bags" loading="lazy" />
              <div className="editorial-card__content">
                <h3>{title}</h3>
                <span>
                  Start Shopping{" "}
                  <span className="promotion-arrow" aria-hidden="true">
                    ↗
                  </span>
                </span>
              </div>
              <span className="category-tile__arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>
      <StylesSection />
      <Newsletter />
    </>
  );
}
function Testimonials() {
  const mobile = useMobile();
  return (
    <section className="section page-width editorial editorial--testimonials">
      <div className="section-heading">
        <h2>What Our Customers Say</h2>
      </div>
      <div className="editorial__grid">
        {[
          ["Annie Bella", "review-anne.webp"],
          ["Amber Heard", "review-amber.webp"],
        ].map(([name, img], index) => (
          <article className="review-card" key={name}>
            <div>
              <blockquote>
                {mobile
                  ? "The perfect balance of style and comfort. Love the quality! Consciously Created Collections That Harmonize Style With Responsibility Wear the Change You Wish To See You!"
                  : "The perfect balance of style and comfort. Love the quality! Consciously created collections that harmonize style with responsibility. Wear the change you wish to see!"}
              </blockquote>
              <p className="review-card__person">
                <img
                  className="review-avatar"
                  src={asset(`mobile-avatar-${index + 1}.webp`)}
                  alt=""
                />
                {mobile ? "Amilie Bella" : name}
                <small>Student</small>
              </p>
            </div>
            <div className="review-card__stat">
              <strong>98%</strong>
              <span>
                {mobile ? "Amilie Satisfaction" : "Style satisfaction"}
              </span>
            </div>
            <img src={asset(img)} alt={name} loading="lazy" />
          </article>
        ))}
      </div>
    </section>
  );
}
function StylesSection() {
  const mobile = useMobile();
  const profiles = useRef(null);
  useEffect(() => {
    if (profiles.current) profiles.current.scrollLeft = mobile ? 128 : 0;
  }, [mobile]);
  return (
    <section className="section editorial editorial--styles">
      <div className="section-heading">
        <h2>Choose From Our Styles</h2>
      </div>
      <div className="style-profiles" ref={profiles}>
        {[
          "Floyd Miles",
          "Annette Black",
          "Jenny Wilson",
          "Ronald Richards",
          "Dianne Russell",
          "Darrell Steward",
          "Arlene McCoy",
          "Brooklyn Simmons",
          "Ralph Edwards",
        ].map((name, i) => (
          <Link key={name} to={collectionLink(i % 2 ? "Women" : "Men")}>
            <img src={asset(`avatar-${(i % 4) + 1}.webp`)} alt="" />
            {name}
          </Link>
        ))}
      </div>
      <div className="editorial__grid">
        {["left", "center", "right"].map((pos) => (
          <Link
            key={pos}
            className="style-card"
            to={collectionLink(pos === "center" ? "Men" : "Women")}
          >
            <img
              src={asset(
                mobile && pos === "center"
                  ? "mobile-style-photo.webp"
                  : `style-${pos}.webp`,
              )}
              alt="Explore our styles"
              loading="lazy"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
function Newsletter() {
  const mobile = useMobile();
  const [email, setEmail] = useSaved("nueve-newsletter", ""),
    [done, setDone] = useState(false);
  return (
    <section className="section page-width">
      <div className="newsletter">
        <div className="newsletter__content">
          <div className="newsletter__brand">
            <Brand />
          </div>
          <h2>
            {mobile ? (
              <>
                Buy 3 &amp; Get One
                <br />
                Product For FREE
              </>
            ) : (
              <>Buy 3 &amp; Get One Product For FREE</>
            )}
          </h2>
          <p>Discover new collections and offers.</p>
        </div>
        <form
          className="newsletter__form"
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <label className="visually-hidden" htmlFor="newsletter-email">
            Your email
          </label>
          <svg
            className="newsletter__email-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="14" rx="1" />
            <path d="m3 6 9 7 9-7" />
          </svg>
          <input
            id="newsletter-email"
            type="email"
            required
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">
            Subscribe <span aria-hidden="true">↗</span>
          </button>
        </form>
        {done && (
          <p className="newsletter-result" role="status">
            Your email is saved in this demo.
          </p>
        )}
        <img
          className="newsletter__model"
          src={asset(
            mobile ? "mobile-newsletter-photo.webp" : "newsletter-model.webp",
          )}
          alt="Latest collection"
          loading="lazy"
        />
      </div>
    </section>
  );
}
function Catalog({ search = false }) {
  const mobile = useMobile();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { route, navigate } = useContext(Store);
  const url = new URL(route, location.origin);
  const filter = url.searchParams.get("filter") || "All",
    query = url.searchParams.get("q") || "";
  const [sort, setSort] = useState("featured"),
    [min, setMin] = useState(""),
    [max, setMax] = useState("");
  const catalogProducts =
    mobile &&
    !search &&
    ["All", "All Collection", "Women", "Women Collection"].includes(filter)
      ? mobileProducts
      : products.filter((p) => !p.mobileOnly);
  let list = filterProducts(catalogProducts, filter)
    .filter(
      (p) =>
        !search ||
        `${p.name} ${p.category} ${p.tags.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .filter(
      (p) =>
        (min === "" || p.price >= Number(min)) &&
        (max === "" || p.price <= Number(max)),
    );
  if (sort === "price-up") list.sort((a, b) => a.price - b.price);
  if (sort === "price-down") list.sort((a, b) => b.price - a.price);
  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  return (
    <section
      className={`section page-width collection-page ${filtersOpen ? "filters-open" : ""}`}
    >
      <div className="catalog-breadcrumb">
        <Breadcrumb title={search ? "Search" : "Shop now"} />
        <button
          className="mobile-filter-toggle"
          aria-label="Show collection filters"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <rect x="4" y="4" width="16" height="16" rx="3" />
            <path d="M14 4v16M17 8h1" />
          </svg>
        </button>
      </div>
      <div className="page-heading">
        <div>
          <h1>
            {search
              ? `Search results for “${query}”`
              : filter === "All"
                ? mobile
                  ? "Women Wear ↘"
                  : "Our Collection"
                : filter}
          </h1>
          <p aria-live="polite">
            {mobile
              ? `Showing 1–${list.length} of ${list.length} Products`
              : `${list.length} products`}
          </p>
        </div>
      </div>
      {search && (
        <form
          className="search-page-form"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(
              `/search?q=${encodeURIComponent(new FormData(e.currentTarget).get("q"))}`,
            );
          }}
        >
          <label className="visually-hidden" htmlFor="catalog-query">
            Search
          </label>
          <input
            id="catalog-query"
            name="q"
            defaultValue={query}
            placeholder="Search products"
            required
          />
          <button className="button button--dark">Search</button>
        </form>
      )}
      <Tabs
        tabs={collectionTabs}
        value={filter}
        onChange={(x) => navigate(collectionLink(x))}
      />
      <Tabs
        tabs={audienceTabs}
        value={
          filter === "All"
            ? "All Collection"
            : filter.endsWith("Collection")
              ? filter
              : `${filter} Collection`
        }
        audience
        onChange={(x) => navigate(collectionLink(x))}
      />
      <div className="collection-controls">
        <label className="sort-form">
          Sort by{" "}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">
              {mobile ? "Most Popular" : "Featured"}
            </option>
            <option value="price-up">Price: low to high</option>
            <option value="price-down">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </label>
        <label>
          Minimum price{" "}
          <input
            className="price-input"
            type="number"
            min="0"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
        </label>
        <label>
          Maximum price{" "}
          <input
            className="price-input"
            type="number"
            min="0"
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
        </label>
        <button
          className="filter-reset"
          onClick={() => {
            setMin("");
            setMax("");
            setSort("featured");
            navigate("/collections/all");
          }}
        >
          Clear filters
        </button>
      </div>
      <div className="product-grid">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {!list.length && (
          <p className="empty-state">
            No products match. Try another filter or search.
          </p>
        )}
      </div>
    </section>
  );
}
function Breadcrumb({ title }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      <span>›</span>
      <span>{title}</span>
    </nav>
  );
}
function Product({ id }) {
  const mobile = useMobile();
  const p = products.find((p) => p.id === id);
  const { route, add, navigate } = useContext(Store);
  const requested = new URL(route, location.origin).searchParams.get("size");
  const [size, setSize] = useState(
    p?.sizes.includes(requested) ? requested : p?.sizes[0],
  );
  const [color, setColor] = useState(p?.colors[0]),
    [quantity, setQuantity] = useState(1),
    [selected, setSelected] = useState(0);
  if (!p) return <NotFound />;
  const gallery = p.gallery || [p.image];
  return (
    <section className="section page-width figma-product-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to={collectionLink(p.category)}>{p.category} Fashion</Link>
        <span>›</span>
        <span>
          {mobile && p.id === "kimono-coat" ? "Long Overcoat" : p.name}
        </span>
      </nav>
      <div
        className={`figma-product-gallery ${gallery.length === 1 ? "single-image" : ""}`}
      >
        {gallery.map((img, i) => (
          <button
            key={img}
            className={`figma-gallery-image gallery-image-${i}`}
            aria-label={`View image ${i + 1}`}
            onClick={() => setSelected(i)}
          >
            <img
              src={asset(
                mobile && p.id === "kimono-coat"
                  ? `mobile-coat-view-${(i === 0 ? selected : i) + 1}.webp`
                  : i === 0
                    ? gallery[selected]
                    : mobile && i === 3
                      ? "mobile-coat-detail.webp"
                      : img,
              )}
              alt={`${p.name} — view ${i + 1}`}
            />
          </button>
        ))}
      </div>
      <div className="figma-product-controls">
        <div className="product-heading">
          <h1>{p.name}</h1>
          <p className="product-rating">
            <span>★ ★ ★ ★ ☆</span> <small>(4.8 From 1200 Reviews)</small>
          </p>
        </div>
        <div className="product-quantity">
          <label htmlFor="product-quantity">Quantity</label>
          <div className="quantity-stepper">
            <button
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => setQuantity(quantity - 1)}
            >
              −
            </button>
            <input
              id="product-quantity"
              aria-label="Quantity"
              type="number"
              min="1"
              max="20"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.min(20, Math.max(1, Number(e.target.value))))
              }
            />
            <button
              aria-label="Increase quantity"
              disabled={quantity >= 20}
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
          </div>
        </div>
        <div className="product-total">
          <p>Total Price</p>
          <strong>
            {mobile ? `${p.price * quantity}$` : money(p.price * quantity)}
          </strong>
          {p.compare && (
            <s>
              {mobile
                ? `${p.compare * quantity}$`
                : money(p.compare * quantity)}
            </s>
          )}
        </div>
        <fieldset className="product-colors">
          <legend>
            Select Color<span className="desktop-only">: {color}</span>
          </legend>
          {p.colors.map((c) => (
            <button
              key={c}
              className={`color-swatch ${c === color ? "selected" : ""}`}
              style={{
                background: {
                  Camel: "#a98059",
                  Grey: "#808080",
                  Ivory: "#ddd",
                  Sand: "#c7b99c",
                  Black: "#252525",
                  Chocolate: "#534034",
                  Navy: "#27374b",
                  "Sky Blue": "#a9c5e2",
                  White: "#fafafa",
                  Charcoal: "#454a54",
                  Beige: "#d9cab0",
                  Blue: "#96b3d0",
                  Yellow: "#efc44e",
                }[c],
              }}
              aria-label={c}
              aria-pressed={c === color}
              onClick={() => setColor(c)}
            />
          ))}
        </fieldset>
        <fieldset className="option-group product-sizes">
          <legend>Select Size</legend>
          {p.sizes.map((s) => (
            <button
              key={s}
              className={s === size ? "selected" : ""}
              aria-pressed={s === size}
              onClick={() => setSize(s)}
            >
              {s}
            </button>
          ))}
        </fieldset>
        <button
          className="button product-add"
          onClick={() => add(p, size, color, quantity)}
        >
          Add to cart <Icon name="cart" />
        </button>
        <button
          className="button button--dark product-buy"
          onClick={() => {
            add(p, size, color, quantity);
            navigate("/checkout");
          }}
        >
          Buy Now
        </button>
      </div>
      <div className="product-story-heading">
        <h2>
          {mobile ? (
            "A Great Coat Doesn’t Just Keep You Warm It Wraps You In Confidence"
          ) : (
            <>
              A Great {p.category === "Accessories" ? "Bag" : "Style"} Doesn’t
              Just Complete
              <br />
              Your Look It Wraps You In Confidence <span>⟶</span>
            </>
          )}
        </h2>
        <p>
          A well-crafted essential is more than just a part of your wardrobe.
          It’s a statement piece, a reflection of personal style, and a timeless
          everyday favorite.
        </p>
      </div>
      {gallery.length > 1 && (
        <div className="product-story-images">
          {[
            [
              gallery[1] || gallery[0],
              "10% Recycled Polyester",
              "Wrap Yourself In Elegance With The Aurora Luxe Sophistication.",
            ],
            [gallery[2] || gallery[0], "90% Cotton", "Double-Breasted Front"],
          ].map(([image, caption, title]) => (
            <figure key={image}>
              <img src={asset(image)} alt={title} loading="lazy" />
              <figcaption className="mobile-only">
                <small>{caption}</small>
                <span>{title}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      <div className="product-specifications">
        <div>
          <h2>Product Detail ↘</h2>
          <ul>
            {[
              "Midweight woven fabric",
              "Regular fit",
              "Peak lapels",
              "Drop shoulders",
              "Front flap pockets",
              "Button cuffs",
              "Hidden inner pocket",
              "90% Cotton 3% Elastane",
              "Double-breasted front",
              "Dry clean only",
            ].map((x) => (
              <li key={x}>✧ {x}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Size &amp; Fit ↘</h2>
          <ul>
            <li>✧ Choose from {p.sizes.join(", ")}</li>
            <li>✧ A relaxed, comfortable fit</li>
            <li>✧ Select your size before adding to your cart</li>
          </ul>
        </div>
      </div>
      <details className="product-detail">
        <summary>Shipping &amp; returns</summary>
        <p>
          This standalone storefront records demo orders. No shipments or
          payments are processed.
        </p>
      </details>
      <div className="mobile-only product-reviews">
        <Testimonials />
      </div>
      <div className="section-heading related-heading">
        <h2>
          {mobile ? "Related Item" : "You May Also Like"} <span>↘</span>
        </h2>
      </div>
      <div className="product-grid">
        {(mobile ? mobileProducts : products.filter((x) => !x.mobileOnly))
          .filter((x) => x.category === p.category && x.id !== p.id)
          .slice(0, 3)
          .map((x) => (
            <ProductCard key={x.id} product={x} />
          ))}
      </div>
      <div className="mobile-only section__footer">
        <Link className="button" to={collectionLink(p.category)}>
          View More ↗
        </Link>
      </div>
      <div className="mobile-only">
        <StylesSection />
        <Newsletter />
      </div>
    </section>
  );
}
function Cart() {
  const { cart, setCart, navigate } = useContext(Store);
  const [code, setCode] = useState(""),
    [coupon, setCoupon] = useSaved("nueve-coupon", ""),
    [error, setError] = useState("");
  const { subtotal, promotion, discount, total } = calculateTotals(
    cart,
    coupon,
  );
  return (
    <section className="section page-width cart-page">
      <Breadcrumb title="Cart" />
      <h1 className="page-title">
        My Cart <span aria-hidden="true">↘</span>
      </h1>
      {!cart.length ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link className="button button--dark" to="/collections/all">
            Start Shopping ↗
          </Link>
        </div>
      ) : (
        <div className="react-cart-layout">
          <div className="cart-items">
            {cart.map((item) => {
              const p = products.find((p) => p.id === item.id);
              return (
                <article className="react-cart-item" key={item.key}>
                  <Link to={`/products/${p.id}`}>
                    <img src={asset(p.image)} alt={p.name} />
                  </Link>
                  <div>
                    <h2>
                      <Link to={`/products/${p.id}`}>{p.name}</Link>
                    </h2>
                    <p>
                      <span className="mobile-only">{p.category}</span>
                      <span className="desktop-only">
                        {item.color} / {item.size}
                      </span>
                    </p>
                    <strong className="cart-unit-price">
                      {mobileMoney(p.price)}
                    </strong>
                    <div className="quantity-stepper">
                      <button
                        aria-label={`Decrease ${p.name} quantity`}
                        disabled={item.quantity === 1}
                        onClick={() =>
                          setCart(
                            cart.map((x) =>
                              x.key === item.key
                                ? { ...x, quantity: x.quantity - 1 }
                                : x,
                            ),
                          )
                        }
                      >
                        −
                      </button>
                      <span aria-label="Quantity">{item.quantity}</span>
                      <button
                        aria-label={`Increase ${p.name} quantity`}
                        disabled={item.quantity >= 20}
                        onClick={() =>
                          setCart(
                            cart.map((x) =>
                              x.key === item.key
                                ? { ...x, quantity: x.quantity + 1 }
                                : x,
                            ),
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      aria-label={`Remove ${p.name}`}
                      className="remove-button"
                      onClick={() =>
                        setCart(cart.filter((x) => x.key !== item.key))
                      }
                    >
                      <span className="desktop-only">Remove</span>
                      <svg
                        className="mobile-only"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden="true"
                      >
                        <path d="M3 5h18M9 2h6M5 5l1 16h12l1-16M10 8v10M14 8v10" />
                      </svg>
                    </button>
                  </div>
                  <strong>{money(p.price * item.quantity)}</strong>
                </article>
              );
            })}
          </div>
          <aside className="order-summary">
            <h2>Order Summary</h2>
            <div>
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            {promotion > 0 && (
              <div>
                <span>Buy 3, get 1 free</span>
                <strong>−{money(promotion)}</strong>
              </div>
            )}
            {discount > 0 && (
              <div>
                <span>Discount (10%)</span>
                <strong>−{money(discount)}</strong>
              </div>
            )}
            <div>
              <span>Shipping</span>
              <span>Free in demo</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
            <form
              className="coupon-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim().toUpperCase() === "NUEVE10") {
                  setCoupon("NUEVE10");
                  setError("");
                } else {
                  setError("Try NUEVE10 for 10% off.");
                }
              }}
            >
              <label htmlFor="discount-code">Discount code</label>
              <input
                id="discount-code"
                placeholder="NUEVE10"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button className="button">Apply</button>
            </form>
            {error && <p role="status">{error}</p>}
            <button
              className="button button--dark"
              onClick={() => navigate("/checkout")}
            >
              <span className="desktop-only">Proceed to Checkout ↗</span>
              <span className="mobile-only">Go to Checkout ⟶</span>
            </button>
            <Link to="/collections/all">Continue Shopping</Link>
          </aside>
        </div>
      )}
      <div className="mobile-only cart-related">
        <div className="section-heading">
          <h2>Related Item ↘</h2>
        </div>
        <div className="product-grid">
          {mobileProducts.slice(0, 3).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="section__footer">
          <Link className="button" to="/collections/all">
            View More ↗
          </Link>
        </div>
        <Newsletter />
      </div>
    </section>
  );
}
function Checkout() {
  const { cart, setCart, navigate, orders, setOrders, profile } =
    useContext(Store);
  const [coupon] = useSaved("nueve-coupon", "");
  const { promotion, discount, total } = calculateTotals(cart, coupon);
  if (!cart.length)
    return (
      <section className="section page-width empty-state">
        <h1>Your cart is empty</h1>
        <Link className="button button--dark" to="/collections/all">
          Shop the collection
        </Link>
      </section>
    );
  return (
    <section className="section page-width">
      <Breadcrumb title="Checkout" />
      <h1>Checkout</h1>
      <p>This is a demo order. No payment will be collected.</p>
      <div className="react-cart-layout">
        <form
          className="checkout-form"
          onSubmit={(e) => {
            e.preventDefault();
            const fields = Object.fromEntries(new FormData(e.currentTarget));
            const order = {
              id: `NV-${Date.now().toString().slice(-8)}`,
              items: cart,
              total,
              customer: fields,
              date: new Date().toISOString(),
            };
            setOrders([order, ...orders]);
            setCart([]);
            navigate(`/orders/${order.id}`);
          }}
        >
          <h2>Contact &amp; delivery</h2>
          {[
            ["name", "Full name", "text"],
            ["email", "Email address", "email"],
            ["address", "Street address", "text"],
            ["city", "City", "text"],
            ["postal", "Postal code", "text"],
            ["country", "Country", "text"],
          ].map(([name, label, type]) => (
            <label key={name}>
              {label}
              <input
                required
                name={name}
                type={type}
                defaultValue={profile?.[name] || ""}
                autoComplete={
                  {
                    name: "name",
                    email: "email",
                    address: "street-address",
                    city: "address-level2",
                    postal: "postal-code",
                    country: "country-name",
                  }[name]
                }
              />
            </label>
          ))}
          <button className="button button--dark">Place Demo Order ↗</button>
        </form>
        <aside className="order-summary">
          <h2>Your Order</h2>
          {cart.map((x) => (
            <div key={x.key}>
              <span>
                {products.find((p) => p.id === x.id).name} × {x.quantity}
                <small>
                  {x.size} / {x.color}
                </small>
              </span>
              <strong>
                {money(products.find((p) => p.id === x.id).price * x.quantity)}
              </strong>
            </div>
          ))}
          {promotion > 0 && (
            <div>
              <span>Buy 3, get 1 free</span>
              <strong>−{money(promotion)}</strong>
            </div>
          )}
          {discount > 0 && (
            <div>
              <span>Discount (10%)</span>
              <strong>−{money(discount)}</strong>
            </div>
          )}
          <div className="summary-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
function Account() {
  const { profile, setProfile, orders } = useContext(Store);
  const [done, setDone] = useState(false);
  return (
    <section className="section page-width">
      <Breadcrumb title="Account" />
      <h1>My Account</h1>
      <p>Your profile and demo orders are saved on this browser.</p>
      <div className="react-cart-layout">
        <form
          className="checkout-form"
          onSubmit={(e) => {
            e.preventDefault();
            setProfile(Object.fromEntries(new FormData(e.currentTarget)));
            setDone(true);
          }}
        >
          <h2>My Profile</h2>
          <label>
            Name
            <input name="name" required defaultValue={profile.name || ""} />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              defaultValue={profile.email || ""}
            />
          </label>
          <button className="button button--dark">Save Profile</button>
          {done && <p role="status">Profile saved.</p>}
        </form>
        <div className="order-summary">
          <h2>Order History</h2>
          {orders.length ? (
            orders.map((o) => (
              <Link className="history-item" to={`/orders/${o.id}`} key={o.id}>
                <span>
                  {o.id}
                  <small>{new Date(o.date).toLocaleDateString()}</small>
                </span>
                <strong>{money(o.total)} ↗</strong>
              </Link>
            ))
          ) : (
            <p>No orders yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
function Order({ id }) {
  const { orders } = useContext(Store);
  const order = orders.find((o) => o.id === id);
  if (!order) return <NotFound />;
  return (
    <section className="section page-width order-confirmation">
      <p className="eyebrow">THANK YOU</p>
      <h1>Your demo order is confirmed.</h1>
      <p>
        Order {order.id} · {money(order.total)}
      </p>
      <p>
        A confirmation is saved in your account. No payment or shipment was
        processed.
      </p>
      <div className="confirmation-items">
        {order.items.map((x) => (
          <p key={x.key}>
            {products.find((p) => p.id === x.id)?.name} — {x.size} / {x.color} ×{" "}
            {x.quantity}
          </p>
        ))}
      </div>
      <Link className="button button--dark" to="/account">
        View My Orders ↗
      </Link>{" "}
      <Link className="button" to="/collections/all">
        Continue Shopping
      </Link>
    </section>
  );
}
function Info({ page }) {
  const [done, setDone] = useState(false);
  const content = {
    faq: [
      "Frequently Asked Questions",
      "How do I choose a size?",
      "Select a product and use its size options. Sizes in this demo are S, M, L, and XL.",
      "Where is my order?",
      "Open My Account to view demo orders saved in your browser.",
    ],
    shipping: [
      "Shipping & Return",
      "Do you deliver orders?",
      "This React storefront is a local demo. It does not process payments, ship products, or initiate returns.",
      "How can I return an item?",
      "A production return policy and service can be connected when this project is deployed.",
    ],
  };
  return (
    <section className="section page-width info-page">
      <Breadcrumb
        title={
          page === "contact" ? "Contact Us" : content[page]?.[0] || "Privacy"
        }
      />
      {page === "contact" ? (
        <>
          <h1>Contact Us</h1>
          <form
            className="checkout-form"
            onSubmit={(e) => {
              e.preventDefault();
              const messages = JSON.parse(
                localStorage.getItem("nueve-messages") || "[]",
              );
              localStorage.setItem(
                "nueve-messages",
                JSON.stringify([
                  ...messages,
                  Object.fromEntries(new FormData(e.currentTarget)),
                ]),
              );
              setDone(true);
              e.currentTarget.reset();
            }}
          >
            <label>
              Name
              <input name="name" required />
            </label>
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <label>
              Message
              <textarea name="message" required rows="6" />
            </label>
            <button className="button button--dark">Save Message</button>
            {done && (
              <p role="status">
                Your message has been saved in this demo. It has not been sent.
              </p>
            )}
          </form>
        </>
      ) : page === "privacy" ? (
        <>
          <h1>Privacy</h1>
          <p>
            This demo stores cart items, profile details, orders, newsletter
            preferences, and contact messages in your browser. These are not
            sent to a server.
          </p>
          <button
            className="button"
            onClick={() => {
              Object.keys(localStorage)
                .filter((k) => k.startsWith("nueve-"))
                .forEach((k) => localStorage.removeItem(k));
              location.reload();
            }}
          >
            Clear Saved Demo Data
          </button>
        </>
      ) : (
        <>
          <h1>{content[page][0]}</h1>
          {[1, 3].map((i) => (
            <details key={i} className="product-detail" open>
              <summary>{content[page][i]}</summary>
              <p>{content[page][i + 1]}</p>
            </details>
          ))}
        </>
      )}
    </section>
  );
}
function SocialIcon({ name }) {
  return name === "Facebook" ? (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h7v-8H9v-3h3V8c0-3 2-4 4-4h3v3h-2c-1 0-1 1-1 2v2h3l-1 3h-2v8h3a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3Z" />
    </svg>
  ) : name === "Instagram" ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-4 19l2-8c-1-3 0-6 2-6s2 2 1 4c-1 3-1 5 1 5 3 0 5-5 4-8-2-5-10-4-11 1 0 2 1 3 2 4l-1 2c-3-1-4-6-2-9 3-4 9-5 13-1 4 4 2 12-3 13-2 1-4 0-5-1l-1 5h2a10 10 0 0 0 0-20Z" />
    </svg>
  );
}
function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-width">
        <Brand footer />
      </div>
      <div className="page-width site-footer__inner">
        <div className="site-footer__brand">
          <p>
            Discover the latest trends, timeless classics, and everything in
            between. From chic streetwear to elegant evening attire,
          </p>
        </div>
        <nav aria-label="Shop">
          <h2>Shop</h2>
          {["Women", "Men", "Accessories", "Sale"].map((x) => (
            <Link key={x} to={collectionLink(x)}>
              {x}
            </Link>
          ))}
        </nav>
        <nav aria-label="Customer Care">
          <h2>Customer Care</h2>
          <Link to="/pages/faq">FAQ</Link>
          <Link to="/pages/shipping">Shipping &amp; Return</Link>
          <Link to="/pages/contact">Contact Us</Link>
        </nav>
        <div className="site-footer__social">
          <h2>Follow Us</h2>
          {["Facebook", "Instagram", "Pinterest"].map((x) => (
            <a
              href={`https://www.${x.toLowerCase()}.com/`}
              target="_blank"
              rel="noopener noreferrer"
              key={x}
            >
              <SocialIcon name={x} />
              {x}
            </a>
          ))}
        </div>
        <small className="site-footer__copyright">
          © {new Date().getFullYear()} Nueve. All Rights Reserved.{" "}
          <Link to="/pages/privacy">Privacy</Link>
        </small>
      </div>
    </footer>
  );
}
function NotFound() {
  return (
    <section className="section page-width empty-state">
      <h1>Page not found</h1>
      <Link className="button button--dark" to="/">
        Back Home
      </Link>
    </section>
  );
}
function App() {
  const [route, setRoute] = useState(location.pathname + location.search);
  const [cart, setCart] = useSaved("nueve-cart", []),
    [profile, setProfile] = useSaved("nueve-profile", {}),
    [orders, setOrders] = useSaved("nueve-orders", []),
    [notice, setNotice] = useState("");
  const navigate = (to) => {
    history.pushState(null, "", to);
    setRoute(to);
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    const pop = () => {
      setRoute(location.pathname + location.search);
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    document.title = `${route === "/" ? "Effortless style" : route.startsWith("/products/") ? products.find((p) => p.id === route.split("/")[2].split("?")[0])?.name || "Product" : route.split("/")[1]} | Nueve`;
  }, [route]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  const add = (p, size, color, quantity) => {
    const key = `${p.id}:${size}:${color}`;
    setCart((items) => {
      const exists = items.find((x) => x.key === key);
      return exists
        ? items.map((x) =>
            x.key === key
              ? { ...x, quantity: Math.min(20, x.quantity + quantity) }
              : x,
          )
        : [...items, { key, id: p.id, size, color, quantity }];
    });
    setNotice(`${p.name} added to cart`);
  };
  const path = route.split("?")[0];
  let page =
    path === "/" ? (
      <Home />
    ) : path.startsWith("/collections") ? (
      <Catalog />
    ) : path === "/search" ? (
      <Catalog search />
    ) : path.startsWith("/products/") ? (
      <Product key={route} id={path.split("/")[2]} />
    ) : path === "/cart" ? (
      <Cart />
    ) : path === "/checkout" ? (
      <Checkout />
    ) : path === "/account" ? (
      <Account />
    ) : path.startsWith("/orders/") ? (
      <Order id={path.split("/")[2]} />
    ) : ["faq", "shipping", "contact", "privacy"].includes(
        path.split("/")[2],
      ) ? (
      <Info key={path} page={path.split("/")[2]} />
    ) : (
      <NotFound />
    );
  return (
    <Store.Provider
      value={{
        route,
        navigate,
        cart,
        setCart,
        add,
        profile,
        setProfile,
        orders,
        setOrders,
      }}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">{page}</main>
      <Footer />
      {notice && (
        <div className="toast" role="status">
          {notice}
          <Link to="/cart">View Cart ↗</Link>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            ×
          </button>
        </div>
      )}
    </Store.Provider>
  );
}
createRoot(document.getElementById("root")).render(<App />);
