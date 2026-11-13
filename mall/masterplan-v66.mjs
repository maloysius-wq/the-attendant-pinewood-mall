/** Architectural contract for review-only Pinewood Mall v66.
 * World metres; do not mutate the six-chapter production runtime.
 * Entire authored world is deterministic and browser-independent.
 */
export const MALL={
  "version": 66,
  "title": "Pinewood Mall / unified rebuild",
  "units": "metres",
  "coordinateSystem": "X east, Z negative north/rear, Y up",
  "footprints": {
    "original": {
      "x1": -47,
      "x2": 47,
      "z1": -118.5,
      "z2": -22.5
    },
    "annex": {
      "x1": 47,
      "x2": 86,
      "z1": -115,
      "z2": -34
    },
    "B1": {
      "x1": -43,
      "x2": 43,
      "z1": -116,
      "z2": -68
    },
    "M1": {
      "x1": -11,
      "x2": 86,
      "z1": -116,
      "z2": -82
    }
  },
  "levels": [
    {
      "id": "G",
      "label": "Ground / Retail",
      "y": 0,
      "publicRetail": true,
      "atriumHeight": 12,
      "description": "Public retail surrounds the single high atrium; no upper shopping level."
    },
    {
      "id": "B1",
      "label": "B1 / Mechanical",
      "y": -4.3,
      "publicRetail": false,
      "atriumHeight": 0,
      "description": "Deep service level; real freight and fire stair vertical transitions."
    },
    {
      "id": "M1",
      "label": "M1 / Administrative",
      "y": 5.4,
      "publicRetail": false,
      "atriumHeight": 0,
      "description": "Restricted offices overlooking only part of the atrium."
    }
  ],
  "rooms": [
    {
      "id": "service_vestibule",
      "label": "Contractor Service Vestibule",
      "level": "G",
      "x1": 9,
      "x2": 16,
      "z1": -43,
      "z2": -22.5,
      "chapter": 1,
      "kind": "staff",
      "story": "The authorized, ordinary way into a closed property. The cinematic ends here."
    },
    {
      "id": "boarded_lobby",
      "label": "Boarded Main Entry",
      "level": "G",
      "x1": -17,
      "x2": 7,
      "z1": -43,
      "z2": -22.5,
      "chapter": 1,
      "kind": "public",
      "story": "The former glass entrance is boarded from the parking lot, with old queue marks inside."
    },
    {
      "id": "central_gallery",
      "label": "Atrium / Dry Fountain",
      "level": "G",
      "x1": -11,
      "x2": 11,
      "z1": -112,
      "z2": -43,
      "chapter": 1,
      "kind": "public",
      "story": "A long, twelve-metre atrium; empty fountain is the orientation and first-evidence landmark."
    },
    {
      "id": "west_gallery",
      "label": "West Shopping Walk",
      "level": "G",
      "x1": -29,
      "x2": -11,
      "z1": -111,
      "z2": -43,
      "chapter": 1,
      "kind": "public",
      "story": "Original 1979 storefronts under failing soffits; lines of sight back toward the fountain."
    },
    {
      "id": "east_gallery",
      "label": "East Shopping Walk",
      "level": "G",
      "x1": 11,
      "x2": 29,
      "z1": -110,
      "z2": -43,
      "chapter": 1,
      "kind": "public",
      "story": "Retail promenade joining the freight lift, security, and later staff wing."
    },
    {
      "id": "west_anchor",
      "label": "Fallow's Department Store",
      "level": "G",
      "x1": -46,
      "x2": -29,
      "z1": -73,
      "z2": -48,
      "chapter": 1,
      "kind": "retail",
      "story": "Original west anchor. Hollow storefront, enormous rolled-up security gate."
    },
    {
      "id": "cassette_castle",
      "label": "Cassette Castle",
      "level": "G",
      "x1": -46,
      "x2": -29,
      "z1": -90,
      "z2": -73,
      "chapter": 1,
      "kind": "retail",
      "story": "Music shop. Final set dressing requires actual vendored full-scale CC0 fixtures."
    },
    {
      "id": "sunburst_arcade",
      "label": "Sunburst Arcade",
      "level": "G",
      "x1": -46,
      "x2": -29,
      "z1": -107,
      "z2": -90,
      "chapter": 1,
      "kind": "retail",
      "story": "Dark arcade; old neon carries through the central gallery."
    },
    {
      "id": "east_original_anchor",
      "label": "Original East Department Store",
      "level": "G",
      "x1": 29,
      "x2": 46,
      "z1": -61,
      "z2": -43,
      "chapter": 1,
      "kind": "retail",
      "story": "One of the earliest large vacancies; partially repurposed."
    },
    {
      "id": "video_planet",
      "label": "Video Planet",
      "level": "G",
      "x1": 29,
      "x2": 46,
      "z1": -80,
      "z2": -61,
      "chapter": 1,
      "kind": "retail",
      "story": "Rental store, Luis's route sketch and long sightlines into the atrium."
    },
    {
      "id": "food_court",
      "label": "Old Food Court",
      "level": "G",
      "x1": 29,
      "x2": 46,
      "z1": -97,
      "z2": -80,
      "chapter": 1,
      "kind": "retail",
      "story": "Half stripped counters, seating, and a view toward the staff-only connector."
    },
    {
      "id": "north_service",
      "label": "Rear Public-Mall Service",
      "level": "G",
      "x1": -11,
      "x2": 11,
      "z1": -118,
      "z2": -112,
      "chapter": 1,
      "kind": "staff",
      "story": "Old stock-to-tenant distribution space behind the long central gallery."
    },
    {
      "id": "freight_lobby",
      "label": "Freight Lift Lobby",
      "level": "G",
      "x1": 11,
      "x2": 29,
      "z1": -118,
      "z2": -110,
      "chapter": 1,
      "kind": "staff",
      "story": "Chapter 1 to Chapter 2 physical vertical handoff, never a scene teleport."
    },
    {
      "id": "security",
      "label": "Security Office and CCTV",
      "level": "G",
      "x1": 29,
      "x2": 46,
      "z1": -115,
      "z2": -101,
      "chapter": 3,
      "kind": "staff",
      "story": "North stair returns from B1 into Luis's surveillance territory."
    },
    {
      "id": "annex_threshold",
      "label": "East Wing Staff Connector",
      "level": "G",
      "x1": 29,
      "x2": 56,
      "z1": -101,
      "z2": -97,
      "chapter": 3,
      "kind": "staff",
      "story": "Physical seam where the 1979 mall meets the 1988-94 addition."
    },
    {
      "id": "receiving_r12",
      "label": "Receiving R-12",
      "level": "G",
      "x1": 47,
      "x2": 56,
      "z1": -115,
      "z2": -101,
      "chapter": 4,
      "kind": "staff",
      "story": "Receiving records show Tessa was sent toward a controlled area, not an exit."
    },
    {
      "id": "east_wing_spine",
      "label": "East Wing Employee Corridor",
      "level": "G",
      "x1": 56,
      "x2": 65,
      "z1": -105,
      "z2": -34,
      "chapter": 4,
      "kind": "staff",
      "story": "Functional back-of-house passage linking stores, staff rooms and final egress."
    },
    {
      "id": "training_t04",
      "label": "Training T-04",
      "level": "G",
      "x1": 65,
      "x2": 85,
      "z1": -108,
      "z2": -97,
      "chapter": 4,
      "kind": "staff",
      "story": "PCAS training materials and staff-route contradictions."
    },
    {
      "id": "break_room",
      "label": "East Wing Break Room",
      "level": "G",
      "x1": 65,
      "x2": 85,
      "z1": -97,
      "z2": -87,
      "chapter": 4,
      "kind": "staff",
      "story": "A once-ordinary room that documents the staff response."
    },
    {
      "id": "staff_lockers",
      "label": "Staff Lockers",
      "level": "G",
      "x1": 65,
      "x2": 85,
      "z1": -87,
      "z2": -75,
      "chapter": 4,
      "kind": "staff",
      "story": "Tessa's mixtape and human stories take precedence over supernatural exposition."
    },
    {
      "id": "annex_anchor",
      "label": "East Wing Anchor",
      "level": "G",
      "x1": 65,
      "x2": 85,
      "z1": -75,
      "z2": -48,
      "chapter": 4,
      "kind": "retail",
      "story": "Later-era annex retail with dead escalator graphics but NO second public level."
    },
    {
      "id": "east_exit_vestibule",
      "label": "East Employee Exit Vestibule",
      "level": "G",
      "x1": 65,
      "x2": 86,
      "z1": -48,
      "z2": -34,
      "chapter": 6,
      "kind": "egress",
      "story": "Real exterior east doorway at x=86, z=-42; release only after clock-out."
    },
    {
      "id": "freight_b1",
      "label": "Basement Freight Lift Landing",
      "level": "B1",
      "x1": 16,
      "x2": 26,
      "z1": -116,
      "z2": -108,
      "chapter": 2,
      "kind": "plant",
      "story": "Same lift shaft as the ground freight lobby."
    },
    {
      "id": "b1_spine",
      "label": "Below-Grade Utility Spine",
      "level": "B1",
      "x1": 6,
      "x2": 16,
      "z1": -114,
      "z2": -75,
      "chapter": 2,
      "kind": "plant",
      "story": "Service corridor with real equipment routing."
    },
    {
      "id": "b1_cross",
      "label": "Basement Cross-Corridor",
      "level": "B1",
      "x1": -37,
      "x2": 35,
      "z1": -108,
      "z2": -102,
      "chapter": 2,
      "kind": "plant",
      "story": "Clear transverse circulation connecting switchgear and the northern stair."
    },
    {
      "id": "relay_d",
      "label": "Relay D Switch Room",
      "level": "B1",
      "x1": -37,
      "x2": -20,
      "z1": -102,
      "z2": -82,
      "chapter": 2,
      "kind": "plant",
      "story": "Noisy first electrical objective."
    },
    {
      "id": "relay_e",
      "label": "Relay E Switch Room",
      "level": "B1",
      "x1": -20,
      "x2": -2,
      "z1": -102,
      "z2": -82,
      "chapter": 2,
      "kind": "plant",
      "story": "Second circuit and escalating machinery acoustics."
    },
    {
      "id": "feeder_room",
      "label": "Emergency Feeder Room",
      "level": "B1",
      "x1": -2,
      "x2": 6,
      "z1": -102,
      "z2": -82,
      "chapter": 2,
      "kind": "plant",
      "story": "Interlock and reading of the main emergency electrical ring."
    },
    {
      "id": "sump_pit",
      "label": "Sump and Pumping Room",
      "level": "B1",
      "x1": -37,
      "x2": -20,
      "z1": -82,
      "z2": -68,
      "chapter": 2,
      "kind": "plant",
      "story": "Leaking pumps and physically motivated wet floor."
    },
    {
      "id": "flooded_walk",
      "label": "Flooded East Service Walk",
      "level": "B1",
      "x1": 16,
      "x2": 35,
      "z1": -102,
      "z2": -82,
      "chapter": 2,
      "kind": "plant",
      "story": "Flooding conceals footsteps and contains a path toward Gavin."
    },
    {
      "id": "gavin_niche",
      "label": "Gavin Cole's Last Service Point",
      "level": "B1",
      "x1": 16,
      "x2": 35,
      "z1": -82,
      "z2": -68,
      "chapter": 2,
      "kind": "plant",
      "story": "Contractor Thirteen's work stops here; recovered records document the next shift."
    },
    {
      "id": "b1_stair",
      "label": "North Fire Stair / B1 Landing",
      "level": "B1",
      "x1": 26,
      "x2": 35,
      "z1": -116,
      "z2": -108,
      "chapter": 2,
      "kind": "stairs",
      "story": "Physical stair to security level, opening Chapter 3."
    },
    {
      "id": "m1_stair",
      "label": "Admin Mezzanine Stair Landing",
      "level": "M1",
      "x1": 47,
      "x2": 56,
      "z1": -115,
      "z2": -102,
      "chapter": 5,
      "kind": "stairs",
      "story": "Controlled ascent directly over Receiving R-12."
    },
    {
      "id": "mezz_hall",
      "label": "Admin Gallery / Atrium Overlook",
      "level": "M1",
      "x1": -11,
      "x2": 80,
      "z1": -102,
      "z2": -94,
      "chapter": 5,
      "kind": "admin",
      "story": "The raised records gallery extends west to the original atrium: a genuine overlook, not a second retail concourse."
    },
    {
      "id": "payroll_office",
      "label": "Payroll Office",
      "level": "M1",
      "x1": 30,
      "x2": 42,
      "z1": -94,
      "z2": -82,
      "chapter": 5,
      "kind": "admin",
      "story": "Historical wage records help confirm staff names and dates."
    },
    {
      "id": "roster_records",
      "label": "Personnel and Roster Archive",
      "level": "M1",
      "x1": 42,
      "x2": 54,
      "z1": -94,
      "z2": -82,
      "chapter": 5,
      "kind": "admin",
      "story": "Last-shift names, LS-07, and duplicate contractor identities."
    },
    {
      "id": "kessler_office",
      "label": "Martin Kessler's Office",
      "level": "M1",
      "x1": 54,
      "x2": 68,
      "z1": -94,
      "z2": -82,
      "chapter": 5,
      "kind": "admin",
      "story": "Management override and deliberately falsified 1997 all-clear, LS-09."
    },
    {
      "id": "contractor_ledger",
      "label": "Contractor Ledger Archive",
      "level": "M1",
      "x1": 68,
      "x2": 80,
      "z1": -94,
      "z2": -82,
      "chapter": 5,
      "kind": "admin",
      "story": "Contractor sessions 01-14 and Contractor Fourteen's assignment."
    },
    {
      "id": "eli_chase",
      "label": "Sealed Eli Utility Chase",
      "level": "M1",
      "x1": 56,
      "x2": 68,
      "z1": -116,
      "z2": -102,
      "chapter": 5,
      "kind": "sealed",
      "story": "Physical hidden route and Eli's remains/recorder; he is not the Attendant."
    },
    {
      "id": "pa_control",
      "label": "PA / Closing Control",
      "level": "M1",
      "x1": 68,
      "x2": 80,
      "z1": -116,
      "z2": -102,
      "chapter": 5,
      "kind": "control",
      "story": "Chapter 6 ritual controls are in an actual service room."
    },
    {
      "id": "pcas_control",
      "label": "PCAS Relay Control",
      "level": "M1",
      "x1": 80,
      "x2": 86,
      "z1": -107,
      "z2": -94,
      "chapter": 5,
      "kind": "control",
      "story": "1997 retrofit and audio ownership; not evidence of cosmic origin."
    }
  ],
  "links": [
    {
      "from": "service_vestibule",
      "to": "central_gallery",
      "type": "passage",
      "minChapter": 1
    },
    {
      "from": "boarded_lobby",
      "to": "central_gallery",
      "type": "passage",
      "minChapter": 1
    },
    {
      "from": "central_gallery",
      "to": "west_gallery",
      "type": "passage",
      "minChapter": 1
    },
    {
      "from": "central_gallery",
      "to": "east_gallery",
      "type": "passage",
      "minChapter": 1
    },
    {
      "from": "central_gallery",
      "to": "north_service",
      "type": "passage",
      "minChapter": 1
    },
    {
      "from": "west_gallery",
      "to": "west_anchor",
      "type": "passage",
      "minChapter": 1
    },
    {
      "from": "west_gallery",
      "to": "cassette_castle",
      "type": "passage",
      "minChapter": 1
    },
    {
      "from": "west_gallery",
      "to": "sunburst_arcade",
      "type": "passage",
      "minChapter": 1
    },
    {
      "from": "east_gallery",
      "to": "east_original_anchor",
      "type": "passage",
      "minChapter": 1
    },
    {
      "from": "east_gallery",
      "to": "video_planet",
      "type": "passage",
      "minChapter": 1
    },
    {
      "from": "east_gallery",
      "to": "food_court",
      "type": "passage",
      "minChapter": 1
    },
    {
      "from": "east_gallery",
      "to": "freight_lobby",
      "type": "passage",
      "minChapter": 1
    },
    {
      "from": "east_gallery",
      "to": "security",
      "type": "passage",
      "minChapter": 1
    },
    {
      "from": "east_gallery",
      "to": "annex_threshold",
      "type": "passage",
      "minChapter": 1
    },
    {
      "from": "security",
      "to": "annex_threshold",
      "type": "passage",
      "minChapter": 1
    },
    {
      "from": "annex_threshold",
      "to": "receiving_r12",
      "type": "passage",
      "minChapter": 4
    },
    {
      "from": "annex_threshold",
      "to": "east_wing_spine",
      "type": "passage",
      "minChapter": 4
    },
    {
      "from": "receiving_r12",
      "to": "east_wing_spine",
      "type": "passage",
      "minChapter": 4
    },
    {
      "from": "east_wing_spine",
      "to": "training_t04",
      "type": "passage",
      "minChapter": 4
    },
    {
      "from": "east_wing_spine",
      "to": "break_room",
      "type": "passage",
      "minChapter": 4
    },
    {
      "from": "east_wing_spine",
      "to": "staff_lockers",
      "type": "passage",
      "minChapter": 4
    },
    {
      "from": "east_wing_spine",
      "to": "annex_anchor",
      "type": "passage",
      "minChapter": 4
    },
    {
      "from": "east_wing_spine",
      "to": "east_exit_vestibule",
      "type": "passage",
      "minChapter": 4
    },
    {
      "from": "annex_anchor",
      "to": "east_exit_vestibule",
      "type": "passage",
      "minChapter": 4
    },
    {
      "from": "freight_b1",
      "to": "b1_spine",
      "type": "passage",
      "minChapter": 2
    },
    {
      "from": "b1_spine",
      "to": "b1_cross",
      "type": "passage",
      "minChapter": 2
    },
    {
      "from": "b1_cross",
      "to": "relay_d",
      "type": "passage",
      "minChapter": 2
    },
    {
      "from": "relay_d",
      "to": "relay_e",
      "type": "passage",
      "minChapter": 2
    },
    {
      "from": "relay_e",
      "to": "feeder_room",
      "type": "passage",
      "minChapter": 2
    },
    {
      "from": "feeder_room",
      "to": "b1_spine",
      "type": "passage",
      "minChapter": 2
    },
    {
      "from": "b1_cross",
      "to": "flooded_walk",
      "type": "passage",
      "minChapter": 2
    },
    {
      "from": "flooded_walk",
      "to": "gavin_niche",
      "type": "passage",
      "minChapter": 2
    },
    {
      "from": "b1_cross",
      "to": "b1_stair",
      "type": "passage",
      "minChapter": 2
    },
    {
      "from": "b1_spine",
      "to": "flooded_walk",
      "type": "passage",
      "minChapter": 2
    },
    {
      "from": "relay_d",
      "to": "sump_pit",
      "type": "passage",
      "minChapter": 2
    },
    {
      "from": "m1_stair",
      "to": "mezz_hall",
      "type": "passage",
      "minChapter": 5
    },
    {
      "from": "mezz_hall",
      "to": "payroll_office",
      "type": "passage",
      "minChapter": 5
    },
    {
      "from": "mezz_hall",
      "to": "roster_records",
      "type": "passage",
      "minChapter": 5
    },
    {
      "from": "mezz_hall",
      "to": "kessler_office",
      "type": "passage",
      "minChapter": 5
    },
    {
      "from": "mezz_hall",
      "to": "contractor_ledger",
      "type": "passage",
      "minChapter": 5
    },
    {
      "from": "mezz_hall",
      "to": "eli_chase",
      "type": "passage",
      "minChapter": 5
    },
    {
      "from": "mezz_hall",
      "to": "pa_control",
      "type": "passage",
      "minChapter": 5
    },
    {
      "from": "mezz_hall",
      "to": "pcas_control",
      "type": "passage",
      "minChapter": 5
    },
    {
      "from": "freight_lobby",
      "to": "freight_b1",
      "type": "elevator",
      "at": {
        "x": 20,
        "z": -113
      },
      "minChapter": 2
    },
    {
      "from": "b1_stair",
      "to": "security",
      "type": "stairs",
      "at": {
        "x": 32,
        "z": -111
      },
      "minChapter": 3
    },
    {
      "from": "receiving_r12",
      "to": "m1_stair",
      "type": "stairs",
      "at": {
        "x": 51,
        "z": -110
      },
      "minChapter": 5
    }
  ],
  "doors": [
    {
      "id": "service_entry",
      "label": "Contractor service entry",
      "level": "G",
      "room": "service_vestibule",
      "x": 12,
      "z": -22.5,
      "status": "active",
      "minChapter": 1
    },
    {
      "id": "main_entry",
      "label": "Boarded public main doors",
      "level": "G",
      "room": "boarded_lobby",
      "x": -10.5,
      "z": -22.5,
      "status": "boarded",
      "minChapter": 1
    },
    {
      "id": "east_employee_exit",
      "label": "East employee exit",
      "level": "G",
      "room": "east_exit_vestibule",
      "x": 86,
      "z": -42,
      "status": "gated",
      "minChapter": 6
    }
  ],
  "landmarks": [
    {
      "id": "dry_fountain",
      "label": "Dry Atrium Fountain",
      "level": "G",
      "room": "central_gallery",
      "x": 0,
      "z": -71,
      "status": "active"
    },
    {
      "id": "staff_notice",
      "label": "Pinewood Public Closure Notice",
      "level": "G",
      "room": "boarded_lobby",
      "x": -10.5,
      "z": -26,
      "status": "boarded"
    },
    {
      "id": "e17_false_route",
      "label": "E-17 False Emergency Route",
      "level": "G",
      "room": "annex_anchor",
      "x": 84,
      "z": -60,
      "status": "sealed"
    },
    {
      "id": "t04_marker",
      "label": "Training T-04 Sign",
      "level": "G",
      "room": "training_t04",
      "x": 76,
      "z": -101,
      "status": "active"
    },
    {
      "id": "r12_marker",
      "label": "Receiving R-12 Ledger",
      "level": "G",
      "room": "receiving_r12",
      "x": 51,
      "z": -109,
      "status": "active"
    },
    {
      "id": "gavin_last_seen",
      "label": "Contractor Thirteen Last Service",
      "level": "B1",
      "room": "gavin_niche",
      "x": 27,
      "z": -75,
      "status": "active"
    },
    {
      "id": "pcas_1997",
      "label": "PCAS Retrofit Rack",
      "level": "M1",
      "room": "pcas_control",
      "x": 83,
      "z": -100,
      "status": "active"
    },
    {
      "id": "east_exit_mark",
      "label": "East Employee Exit",
      "level": "G",
      "room": "east_exit_vestibule",
      "x": 85,
      "z": -42,
      "status": "gated"
    }
  ],
  "evidence": [
    {
      "id": "LS-01",
      "chapter": 1,
      "room": "central_gallery",
      "label": "André's fountain tag"
    },
    {
      "id": "LS-02",
      "chapter": 1,
      "room": "central_gallery",
      "label": "Dead PA tape deck"
    },
    {
      "id": "LS-03",
      "chapter": 1,
      "room": "video_planet",
      "label": "Luis's route sketch"
    },
    {
      "id": "LS-04",
      "chapter": 2,
      "room": "gavin_niche",
      "label": "Jo's torn shift-roster fragment"
    },
    {
      "id": "LS-05",
      "chapter": 3,
      "room": "security",
      "label": "Luis's surveillance VHS"
    },
    {
      "id": "LS-06",
      "chapter": 4,
      "room": "staff_lockers",
      "label": "Tessa's cassette mixtape"
    },
    {
      "id": "LS-07",
      "chapter": 5,
      "room": "roster_records",
      "label": "Complete 1997 final-shift roster"
    },
    {
      "id": "LS-08",
      "chapter": 5,
      "room": "eli_chase",
      "label": "Eli Mercer's final-job recording"
    },
    {
      "id": "LS-09",
      "chapter": 5,
      "room": "kessler_office",
      "label": "Kessler's override and false all-clear"
    }
  ],
  "routes": [
    {
      "chapter": 1,
      "title": "Closing Time",
      "sequence": [
        "service_vestibule",
        "central_gallery",
        "west_gallery",
        "cassette_castle",
        "west_gallery",
        "central_gallery",
        "east_gallery",
        "video_planet",
        "east_gallery",
        "freight_lobby"
      ],
      "beats": "Check in on Renee's timing; orient at fountain; trace Luis's work order and reach freight."
    },
    {
      "chapter": 2,
      "title": "Below Grade",
      "sequence": [
        "freight_lobby",
        "freight_b1",
        "b1_spine",
        "b1_cross",
        "relay_d",
        "relay_e",
        "feeder_room",
        "b1_spine",
        "b1_cross",
        "flooded_walk",
        "gavin_niche",
        "flooded_walk",
        "b1_cross",
        "b1_stair"
      ],
      "beats": "Recover the emergency ring, discover Gavin, and climb a real stair."
    },
    {
      "chapter": 3,
      "title": "Eyes in Security",
      "sequence": [
        "b1_stair",
        "security",
        "east_gallery",
        "security",
        "annex_threshold"
      ],
      "beats": "Find the surveillance trail, contrast PA voice and threat, discover the later wing."
    },
    {
      "chapter": 4,
      "title": "The East Wing",
      "sequence": [
        "annex_threshold",
        "east_wing_spine",
        "staff_lockers",
        "east_wing_spine",
        "training_t04",
        "east_wing_spine",
        "break_room",
        "east_wing_spine",
        "receiving_r12"
      ],
      "beats": "Follow staff evidence via T-04 and R-12; E-17 is a deliberately false route."
    },
    {
      "chapter": 5,
      "title": "Accountability",
      "sequence": [
        "receiving_r12",
        "m1_stair",
        "mezz_hall",
        "payroll_office",
        "mezz_hall",
        "roster_records",
        "mezz_hall",
        "contractor_ledger",
        "mezz_hall",
        "kessler_office",
        "mezz_hall",
        "eli_chase",
        "mezz_hall",
        "pa_control"
      ],
      "beats": "Confirm the original crime, Eli's death and full contractor roster; access the PA."
    },
    {
      "chapter": 6,
      "title": "The Last Shift",
      "sequence": [
        "pa_control",
        "mezz_hall",
        "m1_stair",
        "receiving_r12",
        "east_wing_spine",
        "annex_threshold",
        "east_gallery",
        "central_gallery",
        "east_gallery",
        "annex_threshold",
        "east_wing_spine",
        "east_exit_vestibule"
      ],
      "beats": "Ordered closing ritual and remembered shops lead to earned east egress, with both endings."
    }
  ],
  "phases": [
    {
      "years": "1979",
      "label": "Original public mall"
    },
    {
      "years": "1988–1994",
      "label": "East Wing rear extension"
    },
    {
      "years": "1996–1997",
      "label": "PCAS retrofit and cover-up"
    },
    {
      "years": "1998–2020",
      "label": "Tenant losses and partitions"
    },
    {
      "years": "2020–present",
      "label": "Public closure; authorized utility visits"
    }
  ]
};

const inside=(p,r)=>p.x>=r.x1&&p.x<=r.x2&&p.z>=r.z1&&p.z<=r.z2;
const meets=(a,b)=>Math.min(a.x2,b.x2)>=Math.max(a.x1,b.x1)&&Math.min(a.z2,b.z2)>=Math.max(a.z1,b.z1);
const roomById=id=>MALL.rooms.find(r=>r.id===id);

export function canUseDoor(id,chapter=1){
 const door=MALL.doors.find(d=>d.id===id);
 return !!door && (door.status==='active'||door.status==='gated') && chapter>=door.minChapter;
}

export function findRoute(from,to,{chapter=6}={}){
 if(!roomById(from)||!roomById(to))return null;
 const queue=[[from]],visited=new Set([from]);
 while(queue.length){
  const path=queue.shift(),here=path[path.length-1];
  if(here===to)return path;
  for(const link of MALL.links){
   if(link.minChapter>chapter)continue;
   const next=link.from===here?link.to:link.to===here?link.from:null;
   if(next&&!visited.has(next)){visited.add(next);queue.push([...path,next]);}
  }
 }
 return null;
}

export function validateMasterplan(){
 const errors=[],ids=new Set(),levels=new Set(MALL.levels.map(l=>l.id));
 const footprintList=room=>room.level==='G'?[MALL.footprints.original,MALL.footprints.annex]:[MALL.footprints[room.level]];
 for(const room of MALL.rooms){
  if(ids.has(room.id))errors.push('duplicate room '+room.id);
  ids.add(room.id);
  if(!levels.has(room.level))errors.push('unknown level '+room.id);
  if(!(room.x1<room.x2&&room.z1<room.z2))errors.push('invalid bounds '+room.id);
  const covered=footprintList(room).some(f=>room.x1>=f.x1&&room.x2<=f.x2&&room.z1>=f.z1&&room.z2<=f.z2)||
    (room.id==='annex_threshold'&&room.x1===29&&room.x2===56);
  if(!covered)errors.push('uncontained '+room.id);
 }
 const linkIds=new Set();
 for(const link of MALL.links){
  const a=roomById(link.from),b=roomById(link.to),key=[link.from,link.to].sort().join(':');
  if(linkIds.has(key))errors.push('duplicate link '+key);linkIds.add(key);
  if(!a||!b){errors.push('orphaned portal '+key);continue;}
  if(a.level===b.level){
   if(link.type!=='passage'||!meets(a,b))errors.push('invalid passage '+key);
  }else if(!['stairs','elevator'].includes(link.type)||!link.at||!inside(link.at,a)||!inside(link.at,b))
   errors.push('invalid vertical portal '+key);
 }
 const doorIds=new Set();
 for(const door of MALL.doors){
  if(doorIds.has(door.id))errors.push('duplicate door '+door.id);doorIds.add(door.id);
  if(!roomById(door.room))errors.push('orphaned door '+door.id);
 }
 for(const point of MALL.landmarks){
  const r=roomById(point.room);
  if(!r||point.level!==r.level||!inside(point,r))errors.push('orphaned landmark '+point.id);
 }
 for(const e of MALL.evidence)if(!roomById(e.room))errors.push('orphaned evidence '+e.id);
 for(const route of MALL.routes){
  for(let i=1;i<route.sequence.length;i++){
   const from=route.sequence[i-1],to=route.sequence[i];
   if(!MALL.links.some(l=>l.minChapter<=route.chapter&&
      ((l.from===from&&l.to===to)||(l.from===to&&l.to===from))))
    errors.push('broken chapter '+route.chapter+' path '+from+' -> '+to);
  }
 }
 if(canUseDoor('main_entry',6))errors.push('boarded public door traversable');
 if(canUseDoor('east_employee_exit',5)||!canUseDoor('east_employee_exit',6))errors.push('early final exit');
 return errors;
}
