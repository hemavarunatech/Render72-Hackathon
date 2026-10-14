(() => {
  "use strict";

  const config = window.SIDEQUEST_CONFIG || {};
  const PAGE_SIZE = 8;
  const CACHE_KEY = "sidequest-events-v1";
  const now = new Date();
  const sampleDate = (dayOffset, hour = 18) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  // Clearly labeled local preview content; live data takes precedence when configured.
  const previewEvents = [
    { id: "preview-tiny-worlds", title: "Tiny Worlds, Big Feelings", category: "Workshop", date: sampleDate(1, 16), venue: "The Makers Room", location: "AB3 · Level 2", description: "Make a 15-second stop-motion film with paper, light, and whatever you can find in your bag.", price: "Free", symbol: "✳", palette: "lime", organizer: "Sidequest Studio" },
    { id: "preview-after-rain", title: "After the Rain: Live Sessions", category: "Music", date: sampleDate(2, 18), venue: "The Courtyard", location: "AB1 · Open air", description: "Three local bands, one tiny stage, and a golden-hour set list. Bring a friend or meet one here.", price: "Free entry", symbol: "♫", palette: "blue", organizer: "Soundcheck Society" },
    { id: "preview-good-company", title: "Good Company Picnic Club", category: "Social", date: sampleDate(3, 15), venue: "North Lawn", location: "Near the old banyan", description: "A low-key meet-up for new faces, shared snacks, and absolutely no icebreaker games.", price: "Bring a snack", symbol: "☻", palette: "coral", organizer: "Common Ground" },
    { id: "preview-poster-club", title: "The One-Color Poster Club", category: "Design", date: sampleDate(4, 17), venue: "Print Lab", location: "AB3 · Studio 04", description: "A playful screen-printing session. Pick one color, make a mess, leave with something yours.", price: "Materials included", symbol: "Aa", palette: "purple", organizer: "Open Studio" },
    { id: "preview-short-film", title: "Short Film, Long Conversation", category: "Film", date: sampleDate(5, 19), venue: "Little Screen Room", location: "AB2 · Ground floor", description: "A selection of student-made shorts followed by an easy, open conversation with the filmmakers.", price: "Free", symbol: "▣", palette: "cream", organizer: "Frame by Frame" },
    { id: "preview-night-market", title: "After Hours Mini Market", category: "Community", date: sampleDate(7, 17), venue: "The Walkway", location: "Central campus", description: "Small-batch prints, handmade things, second-hand finds, and a very good chai cart.", price: "Free entry", symbol: "✺", palette: "dark", organizer: "Campus Makers" },
    { id: "preview-open-mic", title: "Mic Check, Heart Check", category: "Music", date: sampleDate(8, 18), venue: "The Common Room", location: "AB4 · Student floor", description: "Songs, stories, half-finished poems. Come perform, come listen, come exactly as you are.", price: "Free", symbol: "♫", palette: "coral", organizer: "Soundcheck Society" },
    { id: "preview-field-notes", title: "Field Notes: A Campus Walk", category: "Outdoors", date: sampleDate(10, 7), venue: "Library Steps", location: "Meet by the east gate", description: "A slow morning walk with a pocket notebook. Notice one small thing you usually walk past.", price: "Free", symbol: "↗", palette: "lime", organizer: "Common Ground" }
  ];

  const html = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const first = (...values) => values.find((value) => value !== undefined && value !== null && value !== "");
  const dateValue = (value) => {
    if (!value) return null;
    if (typeof value === "number") return new Date(value);
    const raw = String(value);
    const plain = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return plain ? new Date(Number(plain[1]), Number(plain[2]) - 1, Number(plain[3])) : new Date(raw);
  };
  const validDate = (date) => date instanceof Date && !Number.isNaN(date.getTime());
  const safeUrl = (value) => {
    if (!value) return "";
    try {
      const url = new URL(String(value), location.origin);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch (_) { return ""; }
  };
  const dateLabel = (value) => {
    const date = dateValue(value);
    return validDate(date) ? new Intl.DateTimeFormat("en-IN", { weekday: "short", month: "short", day: "numeric" }).format(date) : "Date to be announced";
  };
  const timeLabel = (value, separateTime = "") => {
    if (separateTime) {
      const timeMatch = String(separateTime).match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
      if (timeMatch) {
        const date = new Date(2000, 0, 1, Number(timeMatch[1]), Number(timeMatch[2]));
        return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(date);
      }
      return String(separateTime);
    }
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return "Time to be announced";
    const date = dateValue(value);
    return validDate(date) ? new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(date) : "Time to be announced";
  };
  const normalizeEvent = (event, index = 0) => {
    if (!event || typeof event !== "object") return null;
    const title = first(event.title, event.name, event.eventName, event.event_name, "Untitled event");
    const id = first(event.id, event.eventId, event.event_id, event._id, `event-${index + 1}`);
    const rawDate = first(event.startDate, event.start_date, event.eventDate, event.event_date, event.dateTime, event.date_time, event.datetime, event.date, event.startsAt, event.starts_at);
    const separateTime = first(event.startTime, event.start_time, event.eventTime, event.event_time, event.time, "");
    const date = typeof rawDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) && /^\d{1,2}:\d{2}/.test(String(separateTime)) ? `${rawDate}T${separateTime}` : rawDate;
    const venueValue = first(event.venue, event.locationName, event.location_name, event.location, event.place, event.venueName, "Location to be announced");
    const venue = typeof venueValue === "object" ? first(venueValue.name, venueValue.venue, venueValue.title, "Location to be announced") : venueValue;
    const placeDetail = first(event.address, event.addressLine, event.address_line, event.campus, event.room, event.locationDetails, "");
    const category = first(event.category, event.eventType, event.event_type, event.type, event.tag, "Gathering");
    const description = first(event.description, event.summary, event.about, event.details, "A good thing to put on your calendar.");
    const poster = first(event.imageUrl, event.image_url, event.image, event.coverImage, event.cover_image, event.bannerUrl, "");
    const price = first(event.priceLabel, event.price_label, event.price, event.isFree === true ? "Free" : event.is_free === true ? "Free" : "Details inside");
    const palette = ["lime", "blue", "coral", "purple", "cream", "dark"][index % 6];
    return { ...event, id: String(id), title: String(title), date, time: separateTime, venue: String(venue), placeDetail: String(placeDetail), category: String(category), description: String(description), poster: String(poster), price: String(price), symbol: String(first(event.symbol, event.icon, "✳")), palette, organizer: String(first(event.organizer, event.host, event.organizerName, event.organizer_name, "Event team")), registrationUrl: safeUrl(first(event.registrationUrl, event.registration_url, event.url, event.link, "")) };
  };
  const unpack = (json) => {
    const value = json?.events ?? json?.event ?? json?.data?.events ?? json?.data?.event ?? json?.data ?? json?.results ?? json?.items ?? json?.result ?? json;
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object" && ["id", "eventId", "event_id", "_id", "title", "name", "eventName", "event_name"].some((key) => key in value)) return [value];
    return [];
  };
  const isPreview = !config.allEventsUrl;
  let allEvents = [];
  let currentCategory = "all";
  let visibleCount = PAGE_SIZE;

  async function requestJson(url) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), Number(config.requestTimeoutMs) || 8000);
    try {
      const response = await fetch(url, { method: "GET", headers: { Accept: "application/json" }, signal: controller.signal, credentials: "omit" });
      if (!response.ok) throw new Error(`Event service returned ${response.status}`);
      return await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function getCachedEvents() {
    try {
      const item = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      const age = Date.now() - item?.savedAt;
      if (Array.isArray(item?.events) && age >= 0 && age < (Number(config.cacheTtlMs) || 60000)) return item.events;
    } catch (_) { /* Ignore unavailable or malformed cache. */ }
    return null;
  }
  function saveCachedEvents(events) {
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), events })); } catch (_) { /* Storage is an optimization only. */ }
  }

  async function loadEvents() {
    if (isPreview) return { events: previewEvents.map(normalizeEvent), source: "preview" };
    const cached = getCachedEvents();
    if (cached) return { events: cached.map(normalizeEvent).filter(Boolean), source: "cache" };
    try {
      const json = await requestJson(config.allEventsUrl);
      const events = unpack(json).map(normalizeEvent).filter(Boolean);
      saveCachedEvents(events);
      return { events, source: "live" };
    } catch (error) {
      return { events: previewEvents.map(normalizeEvent), source: "fallback", error };
    }
  }

  const list = document.querySelector("#event-list");
  const note = document.querySelector("#results-note");
  const notice = document.querySelector("#feed-notice");
  const emptyState = document.querySelector("#empty-state");
  const loadMore = document.querySelector("#load-more");
  const searchInput = document.querySelector("#event-search");
  const categoryFilters = document.querySelector("#category-filters");
  const sortSelect = document.querySelector("#event-sort");
  const detailSection = document.querySelector("#event-detail");
  const detailContent = document.querySelector("#detail-content");
  const listSection = document.querySelector(".event-explorer");

  function displayNotice(message) {
    if (!notice) return;
    notice.textContent = message;
    notice.hidden = !message;
  }
  function eventPoster(event, detail = false) {
    const posterUrl = safeUrl(event.poster);
    if (posterUrl) return `<div class="${detail ? "detail-poster" : "event-poster"} poster-${html(event.palette)}"><img src="${html(posterUrl)}" alt="" loading="lazy" decoding="async"></div>`;
    return `<div class="${detail ? "detail-poster" : "event-poster"} poster-${html(event.palette)}" aria-hidden="true"><span class="poster-shape">${html(event.symbol)}</span>${detail ? "" : `<span class="poster-word">${html(event.category.toUpperCase())}</span>`}</div>`;
  }
  function renderCard(event) {
    const time = timeLabel(event.date, event.time);
    const date = dateLabel(event.date);
    return `<a class="event-row" href="/events.html?id=${encodeURIComponent(event.id)}" aria-label="View ${html(event.title)} details">
      ${eventPoster(event)}
      <div class="event-copy"><div class="event-meta"><span class="event-category">${html(event.category)}</span><span class="event-meta-dot"></span><span>${html(date)}</span></div><h3>${html(event.title)}</h3><p>${html(event.description)}</p></div>
      <div class="event-place"><strong>${html(event.venue)}</strong><span>${html(time)}${event.placeDetail ? ` · ${html(event.placeDetail)}` : ""}</span></div><span class="event-arrow" aria-hidden="true">↗</span></a>`;
  }
  function renderCategories() {
    if (!categoryFilters) return;
    const categories = [...new Set(allEvents.map((event) => event.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const requestedCategory = new URLSearchParams(location.search).get("category");
    if (requestedCategory && categories.some((category) => category.toLowerCase() === requestedCategory.toLowerCase())) currentCategory = categories.find((category) => category.toLowerCase() === requestedCategory.toLowerCase());
    categoryFilters.innerHTML = `<button class="filter-chip ${currentCategory === "all" ? "is-active" : ""}" type="button" data-category="all" aria-pressed="${currentCategory === "all"}">Everything</button>${categories.map((category) => `<button class="filter-chip ${currentCategory === category ? "is-active" : ""}" type="button" data-category="${html(category)}" aria-pressed="${currentCategory === category}">${html(category)}</button>`).join("")}`;
    categoryFilters.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
      currentCategory = button.dataset.category;
      visibleCount = PAGE_SIZE;
      categoryFilters.querySelectorAll("button").forEach((item) => { const active = item === button; item.classList.toggle("is-active", active); item.setAttribute("aria-pressed", String(active)); });
      renderList();
    }));
  }
  function filteredEvents() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const items = allEvents.filter((event) => {
      const inCategory = currentCategory === "all" || event.category === currentCategory;
      const searchable = `${event.title} ${event.description} ${event.category} ${event.venue} ${event.placeDetail} ${event.organizer}`.toLowerCase();
      return inCategory && (!query || searchable.includes(query));
    });
    const sort = sortSelect?.value || "soonest";
    items.sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      const at = dateValue(a.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bt = dateValue(b.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return sort === "latest" ? bt - at : at - bt;
    });
    return items;
  }
  function renderList() {
    if (!list) return;
    const items = filteredEvents();
    const shown = items.slice(0, visibleCount);
    list.innerHTML = shown.map(renderCard).join("");
    list.setAttribute("aria-busy", "false");
    if (note) note.textContent = `${items.length} ${items.length === 1 ? "good thing" : "good things"} to get out for`;
    const noQuery = !searchInput?.value && currentCategory === "all";
    if (emptyState) emptyState.hidden = !(items.length === 0 && !isPreview);
    if (items.length === 0 && isPreview) {
      if (emptyState) emptyState.hidden = false;
    }
    if (loadMore) loadMore.hidden = shown.length >= items.length;
    if (emptyState) emptyState.hidden = items.length !== 0;
    if (noQuery && items.length === 0 && !isPreview) displayNotice("No events have been published yet. Check back soon.");
  }
  async function renderDetail(eventId) {
    if (!detailSection || !detailContent || !listSection) return;
    listSection.hidden = true;
    detailSection.hidden = false;
    detailContent.innerHTML = `<p class="detail-loading" role="status">Finding the details…</p>`;
    let event = allEvents.find((item) => item.id === eventId);
    let detailError = "";
    if (config.eventByIdUrl) {
      try {
        const url = config.eventByIdUrl.replace("{id}", encodeURIComponent(eventId));
        const data = unpack(await requestJson(url));
        event = normalizeEvent(data[0], 0) || event;
      } catch (_) { detailError = "We couldn’t reach the live event details, so we’re showing saved information if it’s available."; }
    }
    if (!event) {
      detailContent.innerHTML = `<div class="empty-state"><span aria-hidden="true">↗</span><h3>That event wandered off.</h3><p>It may have been removed, or the event feed is taking a break.</p><a class="button button-dark" href="/events.html">Back to all events</a></div>`;
      return;
    }
    const tag = detailError ? `<p class="feed-notice">${html(detailError)}</p>` : "";
    const date = dateLabel(event.date);
    const time = timeLabel(event.date, event.time);
    const register = event.registrationUrl ? `<a class="button button-dark" href="${html(event.registrationUrl)}" target="_blank" rel="noopener noreferrer">Event information <span aria-hidden="true">↗</span></a>` : `<a class="button button-dark" href="mailto:hello@sidequest.example?subject=${encodeURIComponent(`Question about ${event.title}`)}">Ask about this event <span aria-hidden="true">↗</span></a>`;
    detailContent.innerHTML = `${tag}<div class="detail-layout">${eventPoster(event, true)}<div class="detail-copy"><p class="eyebrow"><span class="section-number">${html(event.category.toUpperCase())}</span> / THE DETAILS</p><h1 id="detail-title">${html(event.title)}</h1><p>${html(event.description)}</p><div class="detail-facts"><div class="detail-fact"><span>WHEN</span><strong>${html(date)} · ${html(time)}</strong></div><div class="detail-fact"><span>WHERE</span><strong>${html(event.venue)}${event.placeDetail ? ` · ${html(event.placeDetail)}` : ""}</strong></div><div class="detail-fact"><span>HOSTED BY</span><strong>${html(event.organizer)}</strong></div><div class="detail-fact"><span>ENTRY</span><strong>${html(event.price)}</strong></div></div>${register}</div></div>`;
  }

  document.querySelectorAll("#year").forEach((element) => { element.textContent = String(new Date().getFullYear()); });
  document.querySelectorAll(".menu-toggle").forEach((button) => button.addEventListener("click", () => {
    const nav = document.querySelector(".main-nav");
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav?.classList.toggle("is-open", open);
  }));

  if (list) {
    list.setAttribute("aria-busy", "true");
    loadEvents().then(({ events, source, error }) => {
      allEvents = events;
      if (source === "preview") displayNotice("Preview mode: this draft is showing sample events. Connect the Render72 event endpoints in config.js to load live data.");
      else if (source === "fallback") displayNotice(`The live event feed is unavailable${error?.name === "AbortError" ? " (request timed out)" : " right now"}. Here’s a clearly labeled preview schedule instead.`);
      renderCategories();
      if (source === "preview" || source === "fallback") {
        const banner = document.createElement("span");
        banner.className = "sr-only";
        banner.textContent = "Preview event data";
      }
      const eventId = new URLSearchParams(location.search).get("id");
      renderList();
      if (eventId) renderDetail(eventId);
    });
    searchInput?.addEventListener("input", () => { visibleCount = PAGE_SIZE; renderList(); });
    sortSelect?.addEventListener("change", renderList);
    loadMore?.addEventListener("click", () => { visibleCount += PAGE_SIZE; renderList(); });
    document.querySelector("#clear-filters")?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      currentCategory = "all";
      visibleCount = PAGE_SIZE;
      categoryFilters?.querySelectorAll("button").forEach((button) => { const active = button.dataset.category === "all"; button.classList.toggle("is-active", active); button.setAttribute("aria-pressed", String(active)); });
      if (sortSelect) sortSelect.value = "soonest";
      renderList();
      searchInput?.focus();
    });
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchInput?.focus(); }
    });
  }
})();
