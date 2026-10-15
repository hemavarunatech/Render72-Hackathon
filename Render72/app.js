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
    return plain ? new Date(`${raw}T12:00:00+05:30`) : new Date(raw);
  };
  const validDate = (date) => date instanceof Date && !Number.isNaN(date.getTime());
  const numeric = (value) => value === undefined || value === null || value === "" ? null : Number.isFinite(Number(value)) ? Number(value) : null;
  const safeUrl = (value) => {
    if (!value) return "";
    try {
      const url = new URL(String(value), location.origin);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
    } catch (_) { return ""; }
  };
  const dateLabel = (value) => {
    const date = dateValue(value);
    return validDate(date) ? new Intl.DateTimeFormat("en-IN", { weekday: "short", month: "short", day: "numeric", timeZone: "Asia/Kolkata" }).format(date) : "Date to be announced";
  };
  const timeLabel = (value, separateTime = "") => {
    if (separateTime) {
      const timeMatch = String(separateTime).match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
      if (timeMatch) {
        const hour = Number(timeMatch[1]);
        const minute = Number(timeMatch[2]);
        return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "pm" : "am"}`;
      }
      return String(separateTime);
    }
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return "Time to be announced";
    const date = dateValue(value);
    return validDate(date) ? new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(date) : "Time to be announced";
  };
  const dateKey = (value) => {
    const date = dateValue(value);
    return validDate(date) ? new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Kolkata" }).format(date) : "";
  };
  const eventDateLabel = (event) => event.endDate && dateKey(event.endDate) && dateKey(event.endDate) !== dateKey(event.date) ? `${dateLabel(event.date)} – ${dateLabel(event.endDate)}` : dateLabel(event.date);
  const eventTimeLabel = (event) => {
    const start = timeLabel(event.date, event.time);
    const end = event.endTime ? timeLabel(event.endDate || event.date, event.endTime) : "";
    return end ? `${start} – ${end}` : start;
  };
  const statusLabel = (value) => ({ open: "Registration open", closed: "Registration closed", sold_out: "Sold out", active: "Upcoming", completed: "Completed", unknown: "Registration info" }[String(value || "").toLowerCase()] || String(value || "Details").replaceAll("_", " "));
  const deadlineLabel = (value) => value ? `${dateLabel(value)} · ${timeLabel(value)}` : "Not listed";
  const normalizeEvent = (event, index = 0) => {
    if (!event || typeof event !== "object") return null;
    const schedule = first(event.schedule_summary, event.scheduleSummary, {});
    const title = first(event.title, event.name, event.eventName, event.event_name, "Untitled event");
    const id = first(event.id, event.eventId, event.event_id, event._id, `event-${index + 1}`);
    const rawDate = first(schedule.start_date, event.startDate, event.start_date, event.eventDate, event.event_date, event.dateTime, event.date_time, event.datetime, event.date, event.startsAt, event.starts_at);
    const separateTime = first(schedule.start_time, event.startTime, event.start_time, event.eventTime, event.event_time, event.time, "");
    const rawEndDate = first(schedule.end_date, event.endDate, event.end_date, event.endsAt, event.ends_at, "");
    const endTime = first(schedule.end_time, event.endTime, event.end_time, "");
    const combineDateTime = (day, time) => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day) && /^\d{1,2}:\d{2}/.test(String(time)) ? `${day}T${String(time).slice(0, 5)}:00+05:30` : day;
    const date = combineDateTime(rawDate, separateTime);
    const endDate = combineDateTime(rawEndDate, endTime);
    const venueValue = first(event.venue, event.locationName, event.location_name, event.location, event.place, event.venueName, "");
    const venue = typeof venueValue === "object" ? first(venueValue.name, venueValue.venue, venueValue.title, "") : venueValue;
    const placeDetail = first(event.address, event.addressLine, event.address_line, event.campus, event.room, event.locationDetails, "");
    const category = first(event.category, event.type, event.tag, "Gathering");
    const description = first(event.description, event.blurb, event.summary, event.about, event.details, "A good thing to put on your calendar.");
    const poster = first(event.cover_image_url, event.imageUrl, event.image_url, event.image, event.coverImage, event.cover_image, event.bannerUrl, "");
    const posterAlt = first(event.cover_image_alt, event.image_alt, event.imageAlt, `${title} event cover`, "");
    const rawPrice = numeric(event.price);
    const price = rawPrice !== null ? rawPrice === 0 ? "Free" : `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(rawPrice)}${event.is_per_head ? " / person" : " / team"}` : String(first(event.priceLabel, event.price_label, "See event details"));
    const mode = String(first(event.event_mode, event.eventMode, "")).toUpperCase();
    const locationLabel = mode === "ONLINE" ? "Online" : mode === "OFFLINE" ? "On campus" : String(first(venue, "Location to be announced"));
    const tags = Array.isArray(event.tags) ? event.tags.map(String) : [];
    const seatsTotal = numeric(event.total_seats);
    const seatsFilled = numeric(event.seats_filled);
    const seatsLeft = seatsTotal !== null && seatsTotal > 0 && seatsFilled !== null ? Math.max(0, seatsTotal - seatsFilled) : null;
    const minTeamSize = numeric(event.min_teamsize);
    const maxTeamSize = numeric(event.max_teamsize);
    const palette = ["lime", "blue", "coral", "purple", "cream", "dark"][index % 6];
    return { ...event, id: String(id), title: String(title), date, time: separateTime, endDate, endTime, venue: String(venue || locationLabel), placeDetail: String(placeDetail), category: String(category), description: String(description), poster: String(poster), posterAlt: String(posterAlt), tags, priceLabel: price, eventType: String(first(event.event_type, event.eventType, "EVENT")).toLowerCase(), modeLabel: mode === "ONLINE" ? "Online" : mode === "OFFLINE" ? "Offline" : "Mode to be announced", eventStatus: String(first(event.event_status, event.eventStatus, "ACTIVE")).toLowerCase(), registrationStatus: String(first(event.registration_status, event.registrationStatus, "UNKNOWN")).toLowerCase(), registrationDeadline: first(event.registration_deadline, event.registrationDeadline, ""), isFeatured: Boolean(event.is_featured ?? event.isFeatured), isTechnical: Boolean(event.is_technical ?? event.isTechnical), seatsTotal, seatsFilled, seatsLeft, teamSize: minTeamSize !== null && maxTeamSize !== null ? minTeamSize === 1 && maxTeamSize === 1 ? "Solo entry" : minTeamSize === maxTeamSize ? `${minTeamSize} people` : `${minTeamSize}–${maxTeamSize} people` : "", palette, organizer: String(first(event.organizer, event.host, event.organizerName, event.organizer_name, "Event team")), registrationUrl: safeUrl(first(event.registrationUrl, event.registration_url, event.url, event.link, "")) };
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
  const typeFilter = document.querySelector("#event-type");
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
    if (posterUrl) return `<div class="${detail ? "detail-poster" : "event-poster"} poster-${html(event.palette)}"><img src="${html(posterUrl)}" alt="${detail ? html(event.posterAlt) : ""}" loading="lazy" decoding="async"></div>`;
    return `<div class="${detail ? "detail-poster" : "event-poster"} poster-${html(event.palette)}" aria-hidden="true"><span class="poster-shape">${html(event.symbol)}</span>${detail ? "" : `<span class="poster-word">${html(event.category.toUpperCase())}</span>`}</div>`;
  }
  function renderCard(event) {
    const time = eventTimeLabel(event);
    const date = eventDateLabel(event);
    const availability = event.seatsLeft !== null ? event.seatsLeft === 0 ? "No seats left" : `${event.seatsLeft} seats left` : event.priceLabel;
    const type = event.eventType === "workshop" ? "Workshop" : "Event";
    const featured = event.isFeatured ? `<span class="event-badge badge-featured">Featured</span>` : "";
    return `<a class="event-row${event.isFeatured ? " is-featured" : ""}" href="/events.html?id=${encodeURIComponent(event.id)}" aria-label="View ${html(event.title)} details">
      ${eventPoster(event)}
      <div class="event-copy"><div class="event-meta"><span class="event-category">${html(event.category)}</span><span class="event-meta-dot"></span><span>${html(date)}</span></div><h3>${html(event.title)}</h3><p>${html(event.description)}</p><div class="event-badges">${featured}<span class="event-badge">${html(type)}</span><span class="event-badge">${html(statusLabel(event.registrationStatus))}</span>${event.isTechnical ? `<span class="event-badge">Technical</span>` : ""}</div></div>
      <div class="event-place"><strong>${html(event.venue)}</strong><span>${html(event.modeLabel)} · ${html(time)}</span><span class="event-subinfo">${html(availability)}</span></div><span class="event-arrow" aria-hidden="true">↗</span></a>`;
  }
  function renderCategories() {
    if (!categoryFilters) return;
    const categories = [...new Set(allEvents.map((event) => event.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const requestedCategory = new URLSearchParams(location.search).get("category");
    if (requestedCategory && categories.some((category) => category.toLowerCase() === requestedCategory.toLowerCase())) currentCategory = categories.find((category) => category.toLowerCase() === requestedCategory.toLowerCase());
    const requestedType = new URLSearchParams(location.search).get("type")?.toLowerCase();
    if (requestedType && ["event", "workshop"].includes(requestedType) && typeFilter) typeFilter.value = requestedType;
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
    const currentType = typeFilter?.value || "all";
    const items = allEvents.filter((event) => {
      const inCategory = currentCategory === "all" || event.category === currentCategory;
      const inType = currentType === "all" || event.eventType === currentType;
      const searchable = `${event.title} ${event.description} ${event.category} ${event.venue} ${event.placeDetail} ${event.organizer} ${event.tags.join(" ")} ${event.modeLabel} ${event.eventType}`.toLowerCase();
      return inCategory && inType && (!query || searchable.includes(query));
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
    const noQuery = !searchInput?.value && currentCategory === "all" && (!typeFilter || typeFilter.value === "all");
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
    const date = eventDateLabel(event);
    const time = eventTimeLabel(event);
    const teamLabel = event.teamSize || (numeric(event.min_teamsize) === 1 ? "Solo entry" : "Team details not listed");
    const seatLabel = event.seatsTotal !== null ? `${event.seatsFilled ?? 0} of ${event.seatsTotal} seats taken` : "Capacity not listed";
    const tags = event.tags.length ? `<div class="detail-tags" aria-label="Topics">${event.tags.map((item) => `<span>${html(item)}</span>`).join("")}</div>` : "";
    const register = event.registrationUrl ? `<a class="button button-dark" href="${html(event.registrationUrl)}" target="_blank" rel="noopener noreferrer">Registration details <span aria-hidden="true">↗</span></a>` : "";
    const typeLabel = event.eventType === "workshop" ? "Workshop" : "Event";
    detailContent.innerHTML = `${tag}<div class="detail-layout">${eventPoster(event, true)}<div class="detail-copy"><p class="eyebrow"><span class="section-number">${html(event.category.toUpperCase())}</span> / ${html(statusLabel(event.eventStatus).toUpperCase())}</p><h1 id="detail-title">${html(event.title)}</h1><p>${html(event.description)}</p>${tags}<div class="detail-facts"><div class="detail-fact"><span>WHEN</span><strong>${html(date)} · ${html(time)}</strong></div><div class="detail-fact"><span>FORMAT</span><strong>${html(typeLabel)} · ${html(event.modeLabel)}${event.isTechnical ? " · Technical" : ""}</strong></div><div class="detail-fact"><span>REGISTRATION</span><strong>${html(statusLabel(event.registrationStatus))}<small>${html(deadlineLabel(event.registrationDeadline))}</small></strong></div><div class="detail-fact"><span>ENTRY</span><strong>${html(event.priceLabel)}</strong></div><div class="detail-fact"><span>TEAM SIZE</span><strong>${html(teamLabel)}</strong></div><div class="detail-fact"><span>SEATS</span><strong>${html(seatLabel)}</strong></div></div>${register}</div></div>`;
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
      const eventId = new URLSearchParams(location.search).get("id");
      renderList();
      if (eventId) renderDetail(eventId);
    });
    searchInput?.addEventListener("input", () => { visibleCount = PAGE_SIZE; renderList(); });
    typeFilter?.addEventListener("change", () => { visibleCount = PAGE_SIZE; renderList(); });
    sortSelect?.addEventListener("change", renderList);
    loadMore?.addEventListener("click", () => { visibleCount += PAGE_SIZE; renderList(); });
    document.querySelector("#clear-filters")?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      currentCategory = "all";
      if (typeFilter) typeFilter.value = "all";
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
