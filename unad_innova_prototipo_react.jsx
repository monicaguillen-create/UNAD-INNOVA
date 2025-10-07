import React, { useState, useEffect } from "react";

// UNAD-Innova — Prototipo React (single-file demo)
// - TailwindCSS utility classes assumed available in the environment
// - Uses local state and localStorage for simulated persistence
// - Export default a single React component that renders the interactive prototype

// Helper: generate id
const uid = () => Math.random().toString(36).slice(2, 9);

// Simulated initial data
const initialIdeas = [
  {
    id: uid(),
    title: "Aula Virtual Ecológica",
    author: "Estudiante - Zona Norte",
    category: "Ambiental",
    summary:
      "Programa de aprendizaje con materiales digitales y dinámicas que reduzcan la huella de carbono.",
    details: "Uso de recursos digitales abiertos, huella estimada reducida en 40%.",
    votes: 12,
    status: "Ideado",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    evaluations: [],
  },
  {
    id: uid(),
    title: "Laboratorio Virtual Colaborativo",
    author: "Docente - Centro Bogotá",
    category: "Tecnológica",
    summary: "Plataforma para montar prácticas remotas con feedback automático.",
    details: "Integración con Campus Virtual, se estima reducir costos logísticos.",
    votes: 32,
    status: "En evaluación",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    evaluations: [
      { evaluator: "Comité Académico", score: 4, comment: "Alto impacto" },
    ],
  },
];

const STORAGE_KEY = "unad_innova_demo_v1";

export default function UNADInnovaPrototype() {
  const [tab, setTab] = useState("dashboard");
  const [ideas, setIdeas] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : initialIdeas;
    } catch (e) {
      return initialIdeas;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
  }, [ideas]);

  // Simulated current user
  const currentUser = { name: "Usuario Demo", role: "Estudiante" };

  // Derived metrics for dashboard
  const metrics = {
    totalIdeas: ideas.length,
    ideasInEvaluation: ideas.filter((i) => i.status === "En evaluación").length,
    totalVotes: ideas.reduce((s, i) => s + (i.votes || 0), 0),
    activeZones: Array.from(new Set(ideas.map((i) => i.author.split(" - ")[1] || "General"))).length,
  };

  // Handlers
  const handleCreateIdea = (ideaPayload) => {
    const newIdea = {
      id: uid(),
      ...ideaPayload,
      votes: 0,
      status: "Ideado",
      createdAt: Date.now(),
      evaluations: [],
    };
    setIdeas([newIdea, ...ideas]);
    setTab("dashboard");
  };

  const handleVote = (id) => {
    setIdeas(
      ideas.map((it) => (it.id === id ? { ...it, votes: (it.votes || 0) + 1 } : it))
    );
  };

  const handleEvaluate = (id, evaluation) => {
    setIdeas(
      ideas.map((it) =>
        it.id === id
          ? { ...it, evaluations: [...it.evaluations, evaluation], status: "En evaluación" }
          : it
      )
    );
  };

  const handleAdvanceStatus = (id, status) => {
    setIdeas(ideas.map((it) => (it.id === id ? { ...it, status } : it)));
  };

  const handleUpdateProject = (id, patch) => {
    setIdeas(ideas.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  // Small UI components
  const Nav = () => (
    <nav className="flex gap-2 items-center">
      <button
        className={`px-3 py-1 rounded ${tab === "dashboard" ? "bg-blue-600 text-white" : "bg-white shadow"}`}
        onClick={() => setTab("dashboard")}
      >
        Dashboard
      </button>
      <button
        className={`px-3 py-1 rounded ${tab === "idear" ? "bg-blue-600 text-white" : "bg-white shadow"}`}
        onClick={() => setTab("idear")}
      >
        Enviar idea
      </button>
      <button
        className={`px-3 py-1 rounded ${tab === "evaluar" ? "bg-blue-600 text-white" : "bg-white shadow"}`}
        onClick={() => setTab("evaluar")}
      >
        Evaluar
      </button>
      <button
        className={`px-3 py-1 rounded ${tab === "seguimiento" ? "bg-blue-600 text-white" : "bg-white shadow"}`}
        onClick={() => setTab("seguimiento")}
      >
        Seguimiento
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">UNAD‑Innova — Prototipo Interactivo</h1>
          <p className="text-sm text-gray-600">Flujo: Enviar idea → Evaluación → Seguimiento</p>
        </div>
        <div className="flex gap-4 items-center">
          <Nav />
          <div className="text-right text-sm">
            <div className="font-medium">{currentUser.name}</div>
            <div className="text-xs text-gray-500">{currentUser.role}</div>
          </div>
        </div>
      </header>

      <main>
        {tab === "dashboard" && (
          <Dashboard
            metrics={metrics}
            ideas={ideas}
            onViewIdea={(id) => {
              setTab("seguimiento");
              setTimeout(() => {
                // scroll simulated
                const el = document.getElementById(`idea-${id}`);
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }, 200);
            }}
          />
        )}

        {tab === "idear" && <EnviarIdea onCreate={handleCreateIdea} currentUser={currentUser} />}

        {tab === "evaluar" && (
          <Evaluar ideas={ideas} onEvaluate={handleEvaluate} onVote={handleVote} />
        )}

        {tab === "seguimiento" && (
          <Seguimiento
            ideas={ideas}
            onAdvance={handleAdvanceStatus}
            onUpdate={handleUpdateProject}
            onVote={handleVote}
          />
        )}
      </main>

      <footer className="mt-8 text-xs text-gray-500">Demo interactiva — datos simulados • TRL: Prototipo</footer>
    </div>
  );
}


// -------------------- Subcomponents --------------------

function Dashboard({ metrics, ideas, onViewIdea }) {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card title="Ideas totales" value={metrics.totalIdeas} />
        <Card title="Ideas en evaluación" value={metrics.ideasInEvaluation} />
        <Card title="Votos totales" value={metrics.totalVotes} />
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Ideas destacadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ideas.slice(0, 6).map((it) => (
            <article key={it.id} className="bg-white p-4 rounded shadow" id={`idea-${it.id}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{it.title}</h3>
                  <div className="text-xs text-gray-500">{it.category} — {it.author}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{it.votes} votos</div>
                  <div className="text-xs text-gray-500">{it.status}</div>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-700">{it.summary}</p>
              <div className="mt-3 flex gap-2">
                <button className="px-2 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => onViewIdea(it.id)}>Ver y seguir</button>
                <button className="px-2 py-1 border rounded text-sm" onClick={() => {
                  // quick vote
                  const ev = new CustomEvent('vote', { detail: { id: it.id } });
                  window.dispatchEvent(ev);
                }}>Votar</button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Actividad reciente</h2>
        <ul className="text-sm text-gray-700">
          {ideas.slice(0, 8).map((i) => (
            <li key={i.id} className="py-1 border-b last:border-b-0 flex justify-between">
              <span>{i.title}</span>
              <span className="text-xs text-gray-500">{i.votes} votos • {i.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow flex items-center justify-between">
      <div>
        <div className="text-xs text-gray-500">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div className="text-blue-500 text-3xl">✦</div>
    </div>
  );
}

function EnviarIdea({ onCreate, currentUser }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Académica");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!title || !summary) return alert("Completa título y resumen");
    onCreate({ title, category, summary, details, author: `${currentUser.role} - Zona Demo` });
    setTitle("");
    setCategory("Académica");
    setSummary("");
    setDetails("");
  };

  return (
    <section className="max-w-3xl">
      <h2 className="text-lg font-semibold mb-3">Enviar nueva idea</h2>
      <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
        <div>
          <label className="block text-sm font-medium">Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Categoría</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full border rounded p-2">
            <option>Académica</option>
            <option>Tecnológica</option>
            <option>Social</option>
            <option>Ambiental</option>
            <option>Administrativa</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Resumen (breve)</label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="mt-1 block w-full border rounded p-2" rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium">Detalles (opcional)</label>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} className="mt-1 block w-full border rounded p-2" rows={4} />
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-green-600 text-white rounded" type="submit">Enviar idea</button>
        </div>
      </form>
      <div className="mt-4 text-sm text-gray-500">Al enviar, la idea entrará al flujo institucional: evaluación → votación → seguimiento.</div>
    </section>
  );
}

function Evaluar({ ideas, onEvaluate, onVote }) {
  const [selected, setSelected] = useState(ideas[0]?.id || null);
  const [score, setScore] = useState(3);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const handler = (e) => {
      const id = e.detail.id;
      onVote(id);
    };
    window.addEventListener('vote', handler);
    return () => window.removeEventListener('vote', handler);
  }, [onVote]);

  const submitEval = (e) => {
    e.preventDefault();
    if (!selected) return;
    onEvaluate(selected, { evaluator: "Evaluador Demo", score, comment });
    setComment("");
    alert("Evaluación registrada (simulada)");
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Panel de evaluación</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <aside className="col-span-1 bg-white p-3 rounded shadow">
          <h3 className="font-medium mb-2">Ideas pendientes</h3>
          <ul className="space-y-2 text-sm">
            {ideas.map((i) => (
              <li key={i.id} className={`p-2 rounded border ${selected === i.id ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                <button className="w-full text-left" onClick={() => setSelected(i.id)}>
                  <div className="font-medium">{i.title}</div>
                  <div className="text-xs text-gray-500">{i.votes} votos • {i.status}</div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="col-span-2 bg-white p-4 rounded shadow">
          {selected ? (
            (() => {
              const idea = ideas.find((x) => x.id === selected);
              return (
                <div>
                  <h3 className="text-lg font-semibold">{idea.title}</h3>
                  <div className="text-xs text-gray-500">{idea.category} — {idea.author}</div>
                  <p className="mt-2 text-sm">{idea.details || idea.summary}</p>

                  <form onSubmit={submitEval} className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm">Puntaje (1-5)</label>
                      <input type="range" min={1} max={5} value={score} onChange={(e) => setScore(Number(e.target.value))} />
                      <div className="text-xs text-gray-500">Seleccionado: {score}</div>
                    </div>
                    <div>
                      <label className="block text-sm">Comentarios</label>
                      <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1 block w-full border rounded p-2" rows={3} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button className="px-3 py-1 border rounded" type="button" onClick={() => onVote(idea.id)}>Votar</button>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded" type="submit">Registrar evaluación</button>
                    </div>
                  </form>

                  <div className="mt-4">
                    <h4 className="font-medium">Evaluaciones previas</h4>
                    <ul className="text-sm mt-2 space-y-2">
                      {idea.evaluations.length === 0 && <li className="text-gray-500">Sin evaluaciones registradas.</li>}
                      {idea.evaluations.map((ev, idx) => (
                        <li key={idx} className="border p-2 rounded">
                          <div className="text-xs text-gray-500">{ev.evaluator} • Puntaje: {ev.score}</div>
                          <div className="mt-1">{ev.comment}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-gray-500">Selecciona una idea para evaluar</div>
          )}
        </div>
      </div>
    </section>
  );
}

function Seguimiento({ ideas, onAdvance, onUpdate, onVote }) {
  const statuses = ["Ideado", "En evaluación", "Aprobado", "En implementación", "Completado"];

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Seguimiento de proyectos</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {statuses.map((status) => (
          <div key={status} className="bg-white p-3 rounded shadow">
            <h3 className="font-medium mb-2">{status}</h3>
            <div className="space-y-3">
              {ideas.filter((i) => i.status === status).map((it) => (
                <div key={it.id} className="border p-2 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{it.title}</div>
                      <div className="text-xs text-gray-500">{it.author}</div>
                    </div>
                    <div className="text-right text-xs">
                      <div>{it.votes} votos</div>
                      <div className="text-gray-500">{it.evaluations.length} evaluaciones</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">{it.summary}</div>
                  <div className="mt-2 flex gap-2">
                    <button className="px-2 py-1 border rounded text-sm" onClick={() => onVote(it.id)}>Votar</button>
                    <StatusMenu idea={it} onAdvance={onAdvance} onUpdate={onUpdate} />
                  </div>
                </div>
              ))}

              {ideas.filter((i) => i.status === status).length === 0 && (
                <div className="text-xs text-gray-400">(sin proyectos)</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatusMenu({ idea, onAdvance, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [progress, setProgress] = useState(idea.progress || 0);

  const next = () => {
    const order = ["Ideado", "En evaluación", "Aprobado", "En implementación", "Completado"];
    const idx = order.indexOf(idea.status);
    const nextStatus = order[Math.min(order.length - 1, idx + 1)];
    onAdvance(idea.id, nextStatus);
  };

  const save = () => {
    onUpdate(idea.id, { progress });
    setEditing(false);
  };

  return (
    <div className="flex gap-2">
      <button className="px-2 py-1 bg-yellow-100 rounded text-sm" onClick={next}>Avanzar</button>
      {editing ? (
        <div className="flex gap-2">
          <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
          <button className="px-2 py-1 bg-green-600 text-white rounded text-sm" onClick={save}>Guardar</button>
        </div>
      ) : (
        <button className="px-2 py-1 border rounded text-sm" onClick={() => setEditing(true)}>Editar progreso</button>
      )}
    </div>
  );
}
