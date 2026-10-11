/* ============================================================
   data.js — Definição dos treinos, exercícios e cronograma
   ============================================================ */
(function () {
  "use strict";

  var EXERCISES = {
    flexao: {
      id: "flexao",
      name: "Flexão de braço",
      ill: "flexao",
      sets: 3,
      targetType: "max",
      targetLabel: "O máximo que aguentar",
      unit: "reps",
      short: "Máx. de repetições",
      muscles: ["Peito", "Tríceps", "Ombros", "Core"],
      equipment: "Peso do corpo",
      video: "https://www.youtube.com/watch?v=Jw02VFRfaB0",
      steps: [
        "Deite de barriga para baixo com as mãos na largura dos ombros.",
        "Firme o corpo em prancha, alinhando ombros, quadril e calcanhares.",
        "Desça o peito até quase tocar o chão, cotovelos a ~45° do corpo.",
        "Empurre de volta com força, sem soltar o abdômen."
      ],
      tips: [
        "Abaixe e suba em 2 segundos cada fase para sentir mais.",
        "Não deixe o quadril afundar nem empinar.",
        "Quer mais difícil? Eleve os pés em um apoio baixo."
      ]
    },
    australiana: {
      id: "australiana",
      name: "Barra australiana",
      ill: "australiana",
      sets: 3,
      targetType: "reps",
      reps: 10,
      targetLabel: "10 repetições",
      unit: "reps",
      short: "10 repetições",
      muscles: ["Costas", "Bíceps", "Core"],
      equipment: "Barra baixa",
      video: "https://www.youtube.com/watch?v=_fQQYiU0Ni0",
      steps: [
        "Deite-se sob uma barra baixa e segure-a na largura dos ombros.",
        "Mantenha corpo reto, calcanhares no chão e quadril firme.",
        "Puxe o peito em direção à barra apertando as escápulas.",
        "Desça devagar, controlando até os braços estenderem."
      ],
      tips: [
        "Quanto mais vertical o corpo, mais fácil fica.",
        "Abaixe os pés à frente para aumentar a dificuldade.",
        "Puxe com as costas, não só com os braços."
      ]
    },
    prancha: {
      id: "prancha",
      name: "Prancha abdominal",
      ill: "prancha",
      sets: 3,
      targetType: "time",
      seconds: 30,
      targetLabel: "30 segundos",
      unit: "seg",
      short: "30 segundos",
      muscles: ["Core", "Abdômen", "Glúteos"],
      equipment: "Peso do corpo",
      video: "https://www.youtube.com/watch?v=ffHr8a6DRvU",
      steps: [
        "Apoie antebraços e pontas dos pés no chão.",
        "Cotovelos alinhados abaixo dos ombros, formando 90°.",
        "Contraia abdômen e glúteos para manter o corpo reto.",
        "Olhe para o chão e respire de forma constante."
      ],
      tips: [
        "Nunca deixe o quadril cair ou subir demais.",
        "Segure firme: a prancha é um exercício isométrico.",
        "Sinta o abdômen trabalhando o tempo todo."
      ]
    },
    agachamento: {
      id: "agachamento",
      name: "Agachamento",
      ill: "agachamento",
      sets: 3,
      targetType: "reps",
      reps: 15,
      targetLabel: "15 repetições",
      unit: "reps",
      short: "15 repetições",
      muscles: ["Quadríceps", "Glúteos", "Posterior"],
      equipment: "Peso do corpo",
      video: "https://www.youtube.com/watch?v=bGQSSUhTnjE",
      steps: [
        "Fique em pé com os pés na largura dos ombros.",
        "Empurre o quadril para trás e desça como se fosse sentar.",
        "Vá até onde mantém os calcanhares no chão e as costas retas.",
        "Suba empurrando o chão e contraia os glúteos no topo."
      ],
      tips: [
        "Joelhos acompanham a direção dos pés, sem travar.",
        "Peito aberto e olhar à frente durante o movimento.",
        "Para progredir, agache mais fundo e mais devagar."
      ]
    },
    inclinada: {
      id: "inclinada",
      name: "Flexão inclinada",
      ill: "inclinada",
      sets: 3,
      targetType: "reps",
      reps: 12,
      targetLabel: "12 repetições",
      unit: "reps",
      short: "12 repetições",
      muscles: ["Peito", "Tríceps", "Ombros"],
      equipment: "Apoio elevado",
      video: "https://www.youtube.com/watch?v=rD5pKaYtx2w",
      steps: [
        "Apoie as mãos em uma superfície elevada (mesa ou banco).",
        "Deixe o corpo reto da cabeça aos calcanhares.",
        "Desça o peito até a superfície e empurre de volta.",
        "Mantenha o abdômen contraído o tempo todo."
      ],
      tips: [
        "Ótima para construir força antes da flexão no chão.",
        "Quanto mais alto o apoio, mais fácil.",
        "Desça controlando para no chão encostar de leve."
      ]
    },
    fixa: {
      id: "fixa",
      name: "Barra fixa",
      ill: "fixa",
      sets: 3,
      targetType: "max",
      targetLabel: "O máximo que conseguir",
      unit: "reps",
      short: "Máx. de repetições",
      muscles: ["Costas", "Bíceps", "Antebraço"],
      equipment: "Barra fixa",
      video: "https://www.youtube.com/watch?v=F9nu4mBJNNM",
      steps: [
        "Segure a barra com as mãos um pouco além dos ombros.",
        "Deixe o corpo pendurado e estendido, escápulas ativas.",
        "Puxe o corpo até o queixo passar a barra.",
        "Desça devagar até os braços estenderem por completo."
      ],
      tips: [
        "Não consegue subir? Faça tentativas e segure no topo.",
        "Use negativas: suba com apoio e desça lentamente.",
        "Tente 1 a 2 repetições a mais que na última vez."
      ]
    },
    lateral: {
      id: "lateral",
      name: "Prancha lateral",
      ill: "lateral",
      sets: 3,
      targetType: "time",
      seconds: 20,
      targetLabel: "20 segundos (cada lado)",
      unit: "seg",
      short: "20s por lado",
      muscles: ["Oblíquos", "Core", "Ombros"],
      equipment: "Peso do corpo",
      video: "https://www.youtube.com/watch?v=RPr51FgCYbA",
      steps: [
        "Deite de lado apoiando o antebraço no chão.",
        "Eleve o quadril formando uma linha reta da cabeça aos pés.",
        "Estenda o braço de cima para o alto.",
        "Segure o tempo e troque de lado."
      ],
      tips: [
        "Mantenha o cotovelo abaixo do ombro de apoio.",
        "Não deixe o quadril cair para trás.",
        "Faça 20s de um lado e depois 20s do outro."
      ]
    },
    bulgaro: {
      id: "bulgaro",
      name: "Agachamento búlgaro",
      ill: "bulgaro",
      sets: 3,
      targetType: "reps",
      reps: 10,
      targetLabel: "10 repetições (cada perna)",
      unit: "reps",
      short: "10 por perna",
      muscles: ["Quadríceps", "Glúteos", "Equilíbrio"],
      equipment: "Banco / cadeira",
      video: "https://www.youtube.com/watch?v=0TJAXeE05Jk",
      steps: [
        "Apoie o pé de trás em um banco, a uma distância confortável.",
        "Deixe o pé da frente firme à frente do corpo.",
        "Desça o joelho de trás em direção ao chão, com o tronco ereto.",
        "Suba empurrando o pé da frente e troque de lado."
      ],
      tips: [
        "Faça as 10 repetições de um lado e depois do outro.",
        "Use um apoio para equilíbrio se precisar.",
        "Mantenha a maior parte do peso na perna da frente."
      ]
    }
  };

  var WORKOUTS = {
    A: {
      id: "A",
      name: "Treino A",
      daysLabel: "Segunda e Sexta",
      goal: "Força e volume",
      est: "35–45 min",
      tags: ["Peito", "Costas", "Pernas", "Core"],
      exercises: ["flexao", "australiana", "prancha", "agachamento"]
    },
    B: {
      id: "B",
      name: "Treino B",
      daysLabel: "Quarta-feira",
      goal: "Força e unilateral",
      est: "30–40 min",
      tags: ["Peito", "Costas", "Pernas", "Oblíquos"],
      exercises: ["inclinada", "fixa", "lateral", "bulgaro"]
    }
  };

  /* 0 = domingo ... 6 = sábado */
  var SCHEDULE = {
    0: null,
    1: "A",
    2: null,
    3: "B",
    4: null,
    5: "A",
    6: null
  };

  var DOW = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  var DOW_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  window.WorkoutData = {
    exercises: EXERCISES,
    workouts: WORKOUTS,
    schedule: SCHEDULE,
    dow: DOW,
    dowShort: DOW_SHORT,
    getExercise: function (id) { return EXERCISES[id]; },
    getWorkout: function (id) { return WORKOUTS[id]; },
    workoutForDay: function (dayIndex) { return SCHEDULE[dayIndex] || null; }
  };
})();
