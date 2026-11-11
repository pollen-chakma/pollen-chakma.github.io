/* ==========================================================================
   Pollen Chakma — Academic Portfolio
   Site behavior: theme toggle, mobile nav, reveal animations, publications
   rendering & live search, interactive research program tiles, co-author
   network graph, blog category filters, student checklist, and image lightbox.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- theme toggle ---------- */

  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      var next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ---------- mobile nav ---------- */

  var burger = document.getElementById("nav-burger");
  var nav = document.getElementById("site-nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", nav.classList.contains("open"));
    });
  }

  /* ---------- expandable diagram tiles (research page) ---------- */

  document.querySelectorAll(".rp-expand").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      var detail = btn.querySelector(".rp-detail");
      if (detail) detail.hidden = open;
    });
  });

  /* ---------- reveal on scroll ---------- */

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.06 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- news rendering (home) ---------- */

  var newsRoot = document.getElementById("news-root");
  if (newsRoot && window.SITE_NEWS) {
    window.SITE_NEWS.forEach(function (n) {
      var div = document.createElement("div");
      div.className = "news-item reveal in";
      div.innerHTML =
        '<div class="date">' + n.date + "</div>" +
        '<div class="body">' + n.html + "</div>";
      newsRoot.appendChild(div);
    });
  }

  /* ---------- citation helpers & publications rendering ---------- */

  function enhanceCitation(html) {
    return html.replace(/Chakma,\s*P\./g, "<strong>Chakma, P.</strong>");
  }

  function renderPubSection(id, title, note, groups) {
    var sec = document.createElement("section");
    sec.className = "cite-section";
    sec.id = id;

    var total = 0;
    groups.forEach(function (g) { total += g.items.length; });

    var h2 = document.createElement("h2");
    h2.innerHTML = title + ' <span class="count-pill">' + total + "</span>";
    sec.appendChild(h2);

    if (note) {
      var p = document.createElement("p");
      p.className = "section-note";
      p.textContent = note;
      sec.appendChild(p);
    }

    groups.forEach(function (g) {
      var yb = document.createElement("div");
      yb.className = "year-block";
      var h3 = document.createElement("h3");
      h3.textContent = g.year;
      yb.appendChild(h3);

      var ol = document.createElement("ol");
      ol.className = "cite-list";
      g.items.forEach(function (it) {
        var li = document.createElement("li");
        var rawHtml = typeof it === "string" ? it : it.html;
        li.innerHTML = enhanceCitation(rawHtml);
        if (typeof it === "object" && it.note) {
          var noteDiv = document.createElement("div");
          noteDiv.className = "cite-note";
          noteDiv.innerHTML = enhanceCitation(it.note);
          li.appendChild(noteDiv);
        }
        ol.appendChild(li);
      });
      yb.appendChild(ol);
      sec.appendChild(yb);
    });

    var pill = document.querySelector('[data-count-for="' + id + '"]');
    if (pill) pill.textContent = total;

    return sec;
  }

  var pubsRoot = document.getElementById("pubs-root");
  if (pubsRoot && window.SITE_PUBLICATIONS) {
    var P = window.SITE_PUBLICATIONS;
    if (P.articles && P.articles.length) {
      pubsRoot.appendChild(
        renderPubSection(
          "articles",
          "Refereed Journal Articles",
          "Published peer-reviewed journal articles.",
          P.articles
        )
      );
    }
    if (P.underReview && P.underReview.length) {
      pubsRoot.appendChild(
        renderPubSection(
          "under-review",
          "Journal Manuscripts Under Review & Preprints",
          "Manuscripts currently under peer review or available as preprints.",
          P.underReview
        )
      );
    }
    if (P.proceedings && P.proceedings.length) {
      pubsRoot.appendChild(
        renderPubSection(
          "proceedings",
          "Refereed Conference Proceedings",
          "Peer-reviewed full papers published in international conference proceedings.",
          P.proceedings
        )
      );
    }
    if (P.acceptedProceedings && P.acceptedProceedings.length) {
      pubsRoot.appendChild(
        renderPubSection(
          "accepted",
          "Accepted Conference Manuscripts",
          "Peer-reviewed conference papers accepted for publication.",
          P.acceptedProceedings
        )
      );
    }

    var searchInput = document.getElementById("cite-search");
    var searchMeta = document.getElementById("search-meta");
    if (searchInput) {
      var applyFilter = function () {
        var q = searchInput.value.trim().toLowerCase();
        var allItems = pubsRoot.querySelectorAll(".cite-list li");
        var shown = 0;
        allItems.forEach(function (li) {
          var match = !q || li.textContent.toLowerCase().indexOf(q) !== -1;
          li.classList.toggle("hidden", !match);
          if (match) shown++;
        });
        pubsRoot.querySelectorAll(".year-block").forEach(function (yb) {
          var vis = yb.querySelectorAll(".cite-list li:not(.hidden)").length;
          yb.style.display = vis ? "" : "none";
        });
        pubsRoot.querySelectorAll(".cite-section").forEach(function (cs) {
          var vis = cs.querySelectorAll(".cite-list li:not(.hidden)").length;
          cs.style.display = vis ? "" : "none";
        });
        if (searchMeta) {
          searchMeta.textContent = q
            ? "Showing " + shown + " of " + allItems.length + ' items matching "' + searchInput.value.trim() + '"'
            : "";
        }
      };

      // Support ?q= query parameter from Research page links
      try {
        var params = new URLSearchParams(window.location.search);
        var initialQ = params.get("q");
        if (initialQ) {
          searchInput.value = initialQ;
          applyFilter();
        }
      } catch (e) {}

      searchInput.addEventListener("input", applyFilter);
    }
  }

  /* ---------- prospective student checklist (contact page) ---------- */

  var checklist = document.getElementById("student-checklist");
  var checklistStatus = document.getElementById("checklist-status");
  if (checklist && checklistStatus) {
    var boxes = checklist.querySelectorAll('input[type="checkbox"]');
    var updateChecklist = function () {
      var checked = 0;
      boxes.forEach(function (b) { if (b.checked) checked++; });
      if (checked === 0) {
        checklistStatus.textContent = "Work through the checklist above before sending your inquiry.";
        checklistStatus.classList.remove("is-done");
      } else if (checked < boxes.length) {
        checklistStatus.textContent = checked + " of " + boxes.length + " items completed.";
        checklistStatus.classList.remove("is-done");
      } else {
        checklistStatus.textContent = "All set! You are ready to send your email.";
        checklistStatus.classList.add("is-done");
      }
    };
    boxes.forEach(function (b) { b.addEventListener("change", updateChecklist); });
  }

  /* ---------- blog category filter (posts page) ---------- */

  var blogChips = document.querySelectorAll("[data-blog-filter]");
  if (blogChips.length) {
    blogChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var cat = chip.getAttribute("data-blog-filter");
        blogChips.forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        document.querySelectorAll("[data-blog-cat]").forEach(function (card) {
          var cardCats = card.getAttribute("data-blog-cat").split(",");
          var show = cat === "all" || cardCats.indexOf(cat) !== -1;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* ---------- interactive co-author network (research page) ---------- */

  var nwContainer = document.getElementById("coauthor-network");
  if (nwContainer) {
    var nodes = [
      { id: "Pollen Chakma", role: "center", papers: 10, desc: "Assistant Professor, WRE, CUET" },
      { id: "Dr. Aysha Akter", role: "collab", papers: 2, desc: "Professor, Dept. of Civil Engineering, CUET · M.Sc. Supervisor" },
      { id: "Anika Sirajee", role: "student", papers: 2, desc: "Undergraduate Thesis Advisee · GEE & Climate Extremes" },
      { id: "Md. Modasshir Rokon", role: "student", papers: 3, desc: "Undergraduate Thesis Advisee · Padma & Ganges River Dynamics" },
      { id: "Rubayatul Islam Oishe", role: "student", papers: 3, desc: "Undergraduate Thesis Advisee · Padma & Ganges River Dynamics" },
      { id: "Hera Dutta", role: "ra", papers: 1, desc: "Undergraduate Research Assistant · GIS-MCDM Rainwater Harvesting" },
      { id: "Sehba Yeamin", role: "ra", papers: 1, desc: "Undergraduate Research Assistant · GIS-MCDM Rainwater Harvesting" },
      { id: "Md. Mushfiqul Alam", role: "ra", papers: 1, desc: "Undergraduate Research Assistant · GIS-MCDM Rainwater Harvesting" },
      { id: "Abdullah Al Mahmud", role: "student", papers: 1, desc: "Undergraduate Thesis Advisee · Upper Meghna HEC-RAS 2D" },
      { id: "Araf Bin Haque Annwoy", role: "student", papers: 1, desc: "Undergraduate Thesis Advisee · Upper Meghna HEC-RAS 2D" },
      { id: "Md. Rifat Talha Khan", role: "collab", papers: 1, desc: "Faculty Collaborator, WRE, CUET · Groundwater Recharge" },
      { id: "S. Roy & S. Rahman Apu", role: "collab", papers: 1, desc: "Co-Authors · Padma River Erosion-Accretion Dynamics" },
      { id: "Md. Samiun Basir", role: "collab", papers: 1, desc: "Assistant Professor, WRE, CUET · PI on Urban Flood Grant" },
      { id: "Md. Sohel Rana", role: "collab", papers: 1, desc: "IEER, CUET · PI on Multi-Hazard Coastal Resilience Grant" },
      { id: "Md. Ashraful Islam", role: "collab", papers: 1, desc: "Co-PI on Hybrid Rainwater Harvesting & SHP Grant" }
    ];

    var width = 860, height = 430, cx = width / 2, cy = height / 2;
    var svgNS = "http://www.w3.org/2000/svg";
    var stage = document.createElement("div");
    stage.className = "nw-stage";

    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    svg.setAttribute("class", "nw-svg");

    var infoBar = document.createElement("div");
    infoBar.style.cssText = "position:absolute;bottom:12px;left:16px;right:16px;padding:10px 16px;border-radius:10px;background:var(--bg);border:1px solid var(--border-strong);font-size:0.86rem;color:var(--text-soft);display:flex;justify-content:space-between;align-items:center;gap:12px;box-shadow:var(--shadow-sm);";
    infoBar.innerHTML = '<span><strong>Click or hover any collaborator node</strong> to inspect joint research projects &amp; publications.</span><span style="font-size:0.78rem;color:var(--muted);">15 Collaborators &amp; Co-Authors</span>';

    var others = nodes.slice(1);
    others.forEach(function (n, idx) {
      var angle = (2 * Math.PI * idx) / others.length - Math.PI / 2;
      var rx = idx % 2 === 0 ? 290 : 210;
      var ry = idx % 2 === 0 ? 155 : 115;
      n.x = cx + Math.cos(angle) * rx;
      n.y = cy - 15 + Math.sin(angle) * ry;
    });
    nodes[0].x = cx;
    nodes[0].y = cy - 15;

    // Draw links
    others.forEach(function (n) {
      var line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", nodes[0].x);
      line.setAttribute("y1", nodes[0].y);
      line.setAttribute("x2", n.x);
      line.setAttribute("y2", n.y);
      line.setAttribute("stroke", "var(--accent)");
      line.setAttribute("stroke-opacity", "0.28");
      line.setAttribute("stroke-width", Math.min(4, 1.2 + n.papers * 0.7));
      svg.appendChild(line);
    });

    // Draw nodes
    nodes.forEach(function (n) {
      var g = document.createElementNS(svgNS, "g");
      g.style.cursor = "pointer";

      var circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", n.x);
      circle.setAttribute("cy", n.y);
      var r = n.role === "center" ? 22 : 10 + n.papers * 2.5;
      circle.setAttribute("r", r);

      var fill = "var(--accent)";
      if (n.role === "center") fill = "var(--text)";
      else if (n.role === "ra") fill = "var(--accent-2)";
      else if (n.role === "collab") fill = "var(--accent-amber)";
      circle.setAttribute("fill", fill);
      circle.setAttribute("stroke", "var(--bg-raised)");
      circle.setAttribute("stroke-width", "2.5");

      var label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", n.x);
      label.setAttribute("y", n.y + r + 15);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", "var(--text)");
      label.setAttribute("font-size", n.role === "center" ? "13" : "11.5");
      label.setAttribute("font-weight", n.role === "center" ? "700" : "600");
      label.textContent = n.id;

      g.appendChild(circle);
      g.appendChild(label);

      var showInfo = function () {
        infoBar.innerHTML =
          "<span><strong>" + n.id + "</strong> — " + n.desc + "</span>" +
          '<span class="badge" style="margin:0;">' + n.papers + (n.papers === 1 ? " Joint Output" : " Joint Outputs") + "</span>";
      };
      g.addEventListener("mouseenter", showInfo);
      g.addEventListener("click", showInfo);

      svg.appendChild(g);
    });

    stage.appendChild(svg);
    stage.appendChild(infoBar);
    nwContainer.appendChild(stage);
  }

  /* ---------- image lightbox ---------- */

  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.hidden = true;
  lb.innerHTML =
    '<button class="lightbox-close" aria-label="Close image preview">&times;</button>' +
    '<img src="" alt="">' +
    '<div class="lightbox-caption"></div>';
  document.body.appendChild(lb);

  var lbImg = lb.querySelector("img");
  var lbCap = lb.querySelector(".lightbox-caption");
  var lbClose = lb.querySelector(".lightbox-close");

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || "";
    lbCap.textContent = alt || "";
    lb.hidden = false;
  }

  function closeLightbox() {
    lb.hidden = true;
    lbImg.src = "";
  }

  lbClose.addEventListener("click", closeLightbox);
  lb.addEventListener("click", function (e) {
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lb.hidden) closeLightbox();
  });

  document.querySelectorAll(".app-thumb img, .mini-gallery img, .gallery-item img, .blog-thumb img").forEach(function (img) {
    img.addEventListener("click", function (e) {
      e.preventDefault();
      openLightbox(img.src, img.getAttribute("alt") || img.getAttribute("data-caption") || "");
    });
  });

  /* ---------- footer year ---------- */

  var fy = document.getElementById("footer-year");
  if (fy) fy.textContent = new Date().getFullYear();
})();
