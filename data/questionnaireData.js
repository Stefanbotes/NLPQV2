// CANONICAL SOURCE OF TRUTH for Schema Questionnaire v2 — Leadership (Reflective Coaching Tone)
// 108 Questions | 18 Schemas | 5 Domains | 6 items per schema
// IDs normalized to "<domain>.<schema>.<item>" (e.g., "1.1.1")
// Each schema has 6 items: Cognitive (1-2), Emotional (3-4), Belief (5-6)

export const questionnaireData = {
  version: "2.0.0-leadership",
  lastUpdated: "2025-10-21",
  instrument: "Schema Questionnaire v2 — Leadership (Reflective Coaching Tone)",
  sections: [
    // ============================
    // 1) DISCONNECTION & REJECTION
    // ============================
    {
      name: "DISCONNECTION & REJECTION",
      description: "Fear that sponsorship, respect, or belonging will be withdrawn; expectations of rejection or mistreatment in leadership contexts.",
      variables: [
        {
          variableId: "1.1",
          name: "Abandonment / Instability",
          persona: "The Vigilant Guardian",
          healthyPersona: "The Relationship Champion",
          coreTheme: "Expectation that key support will not last.",
          questions: [
            { id: "1.1.1", order: 1, dimension: "cognitive", text: "I worry that colleagues or stakeholders I rely on may withdraw support, even when things appear to be going well." },
            { id: "1.1.2", order: 2, dimension: "cognitive", text: "I stay alert for signs that a working relationship could cool or that priorities might shift away from my team." },
            { id: "1.1.3", order: 3, dimension: "emotional", text: "When a crucial partner grows distant, I feel a rush of anxiety about projects being left exposed." },
            { id: "1.1.4", order: 4, dimension: "emotional", text: "Unexpected changes in sponsorship make me feel unsettled and preoccupied." },
            { id: "1.1.5", order: 5, dimension: "belief", text: "I believe leadership support is inherently fragile and can vanish quickly." },
            { id: "1.1.6", order: 6, dimension: "belief", text: "I assume alliances rarely endure once pressures or priorities shift." }
          ]
        },
        {
          variableId: "1.2",
          name: "Mistrust / Abuse",
          persona: "The Self-Doubter",
          healthyPersona: "The Authentic Leader",
          coreTheme: "Expectation of exploitation, betrayal, or hidden agendas.",
          questions: [
            { id: "1.2.1", order: 7, dimension: "cognitive", text: "I often anticipate that others will take advantage if I am too open about constraints or risks." },
            { id: "1.2.2", order: 8, dimension: "cognitive", text: "I interpret ambiguous moves from counterparts as potential power plays." },
            { id: "1.2.3", order: 9, dimension: "emotional", text: "When sharing sensitive information, I feel tense, bracing for it to be used against me." },
            { id: "1.2.4", order: 10, dimension: "emotional", text: "If someone misses a commitment, I feel a spike of anger or suspicion." },
            { id: "1.2.5", order: 11, dimension: "belief", text: "I believe most negotiations have hidden traps I must guard against." },
            { id: "1.2.6", order: 12, dimension: "belief", text: "I assume people will prioritize self-interest over fairness if given the chance." }
          ]
        },
        {
          variableId: "1.3",
          name: "Emotional Deprivation",
          persona: "The Selective Connector",
          healthyPersona: "The Emotionally Available Leader",
          coreTheme: "Expectation that reasonable leadership needs (empathy, guidance, recognition) will not be met.",
          questions: [
            { id: "1.3.1", order: 13, dimension: "cognitive", text: "I expect that senior leaders will not offer the guidance or encouragement I need at critical moments." },
            { id: "1.3.2", order: 14, dimension: "cognitive", text: "I assume my efforts will go unrecognized unless I push hard for visibility." },
            { id: "1.3.3", order: 15, dimension: "emotional", text: "When my work is overlooked, I feel a hollow mix of disappointment and resignation." },
            { id: "1.3.4", order: 16, dimension: "emotional", text: "Lack of acknowledgment leaves me feeling isolated in my role." },
            { id: "1.3.5", order: 17, dimension: "belief", text: "I believe leaders should expect to meet their own emotional needs without support." },
            { id: "1.3.6", order: 18, dimension: "belief", text: "I assume recognition is scarce and rarely aligned with real contribution." }
          ]
        },
        {
          variableId: "1.4",
          name: "Defectiveness / Shame",
          persona: "The Skeptical Analyst",
          healthyPersona: "The Trusting Collaborator",
          coreTheme: "Feelings of being flawed, unworthy, or likely to be exposed as inadequate.",
          questions: [
            { id: "1.4.1", order: 19, dimension: "cognitive", text: "I worry that gaps in my skills could be exposed and undermine my credibility." },
            { id: "1.4.2", order: 20, dimension: "cognitive", text: "I read tough feedback as evidence that I am fundamentally not good enough to lead." },
            { id: "1.4.3", order: 21, dimension: "emotional", text: "Public mistakes trigger shame that lingers long after the incident." },
            { id: "1.4.4", order: 22, dimension: "emotional", text: "Presenting to senior stakeholders can bring a fear of being found out." },
            { id: "1.4.5", order: 23, dimension: "belief", text: "I believe I must hide my weaknesses to be accepted as a leader." },
            { id: "1.4.6", order: 24, dimension: "belief", text: "I assume others would judge me harshly if they saw the full picture of my limitations." }
          ]
        },
        {
          variableId: "1.5",
          name: "Social Isolation / Alienation",
          persona: "The Lone Operator",
          healthyPersona: "The Connected Leader",
          coreTheme: "Feeling different, excluded, or not fitting into leadership circles.",
          questions: [
            { id: "1.5.1", order: 25, dimension: "cognitive", text: "I often assume I don't fully belong in influential leadership groups." },
            { id: "1.5.2", order: 26, dimension: "cognitive", text: "I expect informal networks to remain closed to me and my team." },
            { id: "1.5.3", order: 27, dimension: "emotional", text: "Networking events leave me feeling on the outside looking in." },
            { id: "1.5.4", order: 28, dimension: "emotional", text: "When peers bond easily, I feel a pang of exclusion." },
            { id: "1.5.5", order: 29, dimension: "belief", text: "I believe leadership is often a lonely role where true belonging is rare." },
            { id: "1.5.6", order: 30, dimension: "belief", text: "I assume gatekeeping is a constant barrier to inclusion." }
          ]
        }
      ]
    },

    // ============================
    // 2) IMPAIRED AUTONOMY & PERFORMANCE
    // ============================
    {
      name: "IMPAIRED AUTONOMY & PERFORMANCE",
      description: "Doubts about self-direction, resilience, or capability in leadership tasks.",
      variables: [
        {
          variableId: "2.1",
          name: "Dependence / Incompetence",
          persona: "The Supported Contributor",
          healthyPersona: "The Self-Reliant Professional",
          coreTheme: "Belief that one cannot handle responsibilities without extensive help.",
          questions: [
            { id: "2.1.1", order: 31, dimension: "cognitive", text: "I believe others are often better than I am at making strategic leadership decisions." },
            { id: "2.1.2", order: 32, dimension: "cognitive", text: "When a situation is ambiguous, my instinct is to wait for direction from someone more senior." },
            { id: "2.1.3", order: 33, dimension: "emotional", text: "I feel uncomfortable taking full ownership of decisions when senior leaders are not available to advise me." },
            { id: "2.1.4", order: 34, dimension: "emotional", text: "Without clear guidance, I feel anxious about moving initiatives forward." },
            { id: "2.1.5", order: 35, dimension: "belief", text: "I believe important calls should be made by those with more authority than me." },
            { id: "2.1.6", order: 36, dimension: "belief", text: "I assume I need strong oversight to avoid making poor choices." }
          ]
        },
        {
          variableId: "2.2",
          name: "Vulnerability to Harm / Illness",
          persona: "The Cautious Planner",
          healthyPersona: "The Confident Strategist",
          coreTheme: "Exaggerated fears of catastrophe or collapse in leadership settings.",
          questions: [
            { id: "2.2.1", order: 37, dimension: "cognitive", text: "I frequently imagine worst-case scenarios for my organization or team." },
            { id: "2.2.2", order: 38, dimension: "cognitive", text: "I overestimate the likelihood that a single mistake could spiral into disaster." },
            { id: "2.2.3", order: 39, dimension: "emotional", text: "News of disruption (market, regulatory, tech) quickly spikes my anxiety." },
            { id: "2.2.4", order: 40, dimension: "emotional", text: "Operational incidents leave me rattled for longer than I'd like." },
            { id: "2.2.5", order: 41, dimension: "belief", text: "I believe the environment is inherently unsafe and leaders must always brace for collapse." },
            { id: "2.2.6", order: 42, dimension: "belief", text: "I assume setbacks will escalate unless tightly controlled." }
          ]
        },
        {
          variableId: "2.3",
          name: "Enmeshment / Undeveloped Self",
          persona: "The Fused Collaborator",
          healthyPersona: "The Differentiated Leader",
          coreTheme: "Over-involvement with key others; difficulty forming a separate leadership identity.",
          questions: [
            { id: "2.3.1", order: 43, dimension: "cognitive", text: "I often define my leadership stance by aligning with a powerful figure rather than forming my own view." },
            { id: "2.3.2", order: 44, dimension: "cognitive", text: "I defer to certain allies so much that my independent voice is unclear." },
            { id: "2.3.3", order: 45, dimension: "emotional", text: "Disagreeing with a close mentor or sponsor makes me feel guilty and uneasy." },
            { id: "2.3.4", order: 46, dimension: "emotional", text: "When a key relationship is strained, I feel unmoored in my role." },
            { id: "2.3.5", order: 47, dimension: "belief", text: "I believe it's safer to merge my priorities with those of influential leaders." },
            { id: "2.3.6", order: 48, dimension: "belief", text: "I assume my leadership value comes mainly from proximity to powerful people." }
          ]
        },
        {
          variableId: "2.4",
          name: "Failure",
          persona: "The Self-Doubter",
          healthyPersona: "The Authentic Leader",
          coreTheme: "Belief that one is fundamentally inadequate in achievement contexts.",
          questions: [
            { id: "2.4.1", order: 49, dimension: "cognitive", text: "I often predict that my initiatives will fall short compared to peers' work." },
            { id: "2.4.2", order: 50, dimension: "cognitive", text: "I interpret obstacles as signs that I'm not up to the task." },
            { id: "2.4.3", order: 51, dimension: "emotional", text: "Performance reviews trigger disproportionate dread for me." },
            { id: "2.4.4", order: 52, dimension: "emotional", text: "When metrics dip, I feel a surge of inadequacy." },
            { id: "2.4.5", order: 53, dimension: "belief", text: "I believe others are more capable of achieving ambitious targets than I am." },
            { id: "2.4.6", order: 54, dimension: "belief", text: "I assume success is unlikely to last if it happens under my leadership." }
          ]
        }
      ]
    },

    // ============================
    // 3) IMPAIRED LIMITS
    // ============================
    {
      name: "IMPAIRED LIMITS",
      description: "Difficulties with boundaries, reciprocity, or self-discipline in leadership.",
      variables: [
        {
          variableId: "3.1",
          name: "Entitlement / Grandiosity",
          persona: "The Status Seeker",
          healthyPersona: "The Humble Achiever",
          coreTheme: "Belief in special status, exemptions, or superiority.",
          questions: [
            { id: "3.1.1", order: 55, dimension: "cognitive", text: "I have thought my ideas or priorities should take precedence over others'." },
            { id: "3.1.2", order: 56, dimension: "cognitive", text: "I feel irritated when my contributions or expertise are not recognized promptly." },
            { id: "3.1.3", order: 57, dimension: "emotional", text: "I feel frustrated when I am treated the same as peers whose contributions seem smaller." },
            { id: "3.1.4", order: 58, dimension: "emotional", text: "I become resentful when decision rights do not tilt toward me." },
            { id: "3.1.5", order: 59, dimension: "belief", text: "I believe my perspective deserves extra weight in most discussions." },
            { id: "3.1.6", order: 60, dimension: "belief", text: "I assume exceptions should sometimes be made for me to move things faster." }
          ]
        },
        {
          variableId: "3.2",
          name: "Insufficient Self-Control / Self-Discipline",
          persona: "The Reactive Responder",
          healthyPersona: "The Composed Professional",
          coreTheme: "Difficulty with impulse control, follow-through, or tolerating limits.",
          questions: [
            { id: "3.2.1", order: 61, dimension: "cognitive", text: "I often prioritize what feels urgent now over disciplined execution of plans." },
            { id: "3.2.2", order: 62, dimension: "cognitive", text: "I downplay the risks of skipping process when I want faster progress." },
            { id: "3.2.3", order: 63, dimension: "emotional", text: "I feel restless when work requires sustained, methodical effort." },
            { id: "3.2.4", order: 64, dimension: "emotional", text: "When blocked, I get impatient and push past agreed constraints." },
            { id: "3.2.5", order: 65, dimension: "belief", text: "I believe strong leaders should be free to bend rules to achieve outcomes." },
            { id: "3.2.6", order: 66, dimension: "belief", text: "I assume discipline can slow momentum more than it helps." }
          ]
        }
      ]
    },

    // ============================
    // 4) OTHER-DIRECTEDNESS
    // ============================
    {
      name: "OTHER-DIRECTEDNESS",
      description: "Over-focusing on others' approval, needs, or reactions at the expense of one's own leadership judgment.",
      variables: [
        {
          variableId: "4.1",
          name: "Subjugation",
          persona: "The People Pleaser",
          healthyPersona: "The Assertive Influencer",
          coreTheme: "Suppressing one's voice to avoid conflict or disapproval, even when it hurts outcomes.",
          questions: [
            { id: "4.1.1", order: 67, dimension: "cognitive", text: "I often hold back my perspective in meetings to keep interactions smooth, even when my input would affect decisions." },
            { id: "4.1.2", order: 68, dimension: "cognitive", text: "I assume it's safer to agree than to risk appearing difficult, so I frequently avoid dissenting publicly." },
            { id: "4.1.3", order: 69, dimension: "emotional", text: "When I challenge someone senior, I feel anxious and preoccupied until I sense things are back to normal." },
            { id: "4.1.4", order: 70, dimension: "emotional", text: "Standing firm on an unpopular view triggers guilt and worry that I've upset others." },
            { id: "4.1.5", order: 71, dimension: "belief", text: "I believe harmony is more important than voicing concerns that might cause friction." },
            { id: "4.1.6", order: 72, dimension: "belief", text: "I assume pushing back publicly usually does more harm than good." }
          ]
        },
        {
          variableId: "4.2",
          name: "Self-Sacrifice",
          persona: "The Devoted Supporter",
          healthyPersona: "The Balanced Contributor",
          coreTheme: "Excessive focus on others' needs at the expense of one's own limits and priorities.",
          questions: [
            { id: "4.2.1", order: 73, dimension: "cognitive", text: "I take on others' workloads to keep the team comfortable, even when it strains my priorities." },
            { id: "4.2.2", order: 74, dimension: "cognitive", text: "I downplay my bandwidth limits so others won't feel pressured." },
            { id: "4.2.3", order: 75, dimension: "emotional", text: "Saying no to a request makes me feel uneasy or guilty." },
            { id: "4.2.4", order: 76, dimension: "emotional", text: "I feel responsible for others' stress and try to absorb it myself." },
            { id: "4.2.5", order: 77, dimension: "belief", text: "I believe good leaders should carry more than their fair share for the team." },
            { id: "4.2.6", order: 78, dimension: "belief", text: "I assume my needs should come second to the organization's needs." }
          ]
        },
        {
          variableId: "4.3",
          name: "Approval-Seeking / Recognition-Seeking",
          persona: "The Recognition Seeker",
          healthyPersona: "The Self-Assured Leader",
          coreTheme: "Placing excessive emphasis on status or validation to guide decisions.",
          questions: [
            { id: "4.3.1", order: 79, dimension: "cognitive", text: "I track how visible I am to senior leaders and make choices to boost that visibility." },
            { id: "4.3.2", order: 80, dimension: "cognitive", text: "I weigh reputational optics heavily when deciding what to prioritize." },
            { id: "4.3.3", order: 81, dimension: "emotional", text: "Praise gives me a disproportionate lift compared to solid but unseen progress." },
            { id: "4.3.4", order: 82, dimension: "emotional", text: "Criticism stings more than I'd like and lingers in my mind." },
            { id: "4.3.5", order: 83, dimension: "belief", text: "I believe recognition is a primary indicator of leadership success." },
            { id: "4.3.6", order: 84, dimension: "belief", text: "I assume perception often matters more than underlying results." }
          ]
        }
      ]
    },

    // ============================
    // 5) OVERVIGILANCE & INHIBITION
    // ============================
    {
      name: "OVERVIGILANCE & INHIBITION",
      description: "Overemphasis on rules, control, and threat scanning; suppression of spontaneity or needs.",
      variables: [
        {
          variableId: "5.1",
          name: "Negativity / Pessimism",
          persona: "The Realist",
          healthyPersona: "The Balanced Optimist",
          coreTheme: "Tendency to over-focus on potential problems and discount positives.",
          questions: [
            { id: "5.1.1", order: 85, dimension: "cognitive", text: "As a leader, I notice potential problems in a project before I recognize opportunities or strengths." },
            { id: "5.1.2", order: 86, dimension: "cognitive", text: "I often expect successes to be temporary or vulnerable to sudden setbacks." },
            { id: "5.1.3", order: 87, dimension: "emotional", text: "Even when operations look smooth, I feel uneasy, anticipating they might collapse." },
            { id: "5.1.4", order: 88, dimension: "emotional", text: "It's hard for me to relax because I'm constantly scanning for potential failures." },
            { id: "5.1.5", order: 89, dimension: "belief", text: "I believe optimism can be naive and may leave leaders unprepared." },
            { id: "5.1.6", order: 90, dimension: "belief", text: "I assume unseen risks are usually waiting beneath positive trends." }
          ]
        },
        {
          variableId: "5.2",
          name: "Emotional Inhibition",
          persona: "The Controlled Executor",
          healthyPersona: "The Emotionally Expressive Leader",
          coreTheme: "Inhibiting feelings and communication to avoid mistakes or disapproval.",
          questions: [
            { id: "5.2.1", order: 91, dimension: "cognitive", text: "I plan my words carefully to avoid showing emotion in high-stakes settings." },
            { id: "5.2.2", order: 92, dimension: "cognitive", text: "I equate emotional expression with losing control of the narrative." },
            { id: "5.2.3", order: 93, dimension: "emotional", text: "Sharing personal reactions at work makes me feel exposed." },
            { id: "5.2.4", order: 94, dimension: "emotional", text: "I feel tense when others bring strong emotions into meetings." },
            { id: "5.2.5", order: 95, dimension: "belief", text: "I believe leaders should keep emotions out of decision forums." },
            { id: "5.2.6", order: 96, dimension: "belief", text: "I assume restraint is safer than being expressive, even when authenticity could help." }
          ]
        },
        {
          variableId: "5.3",
          name: "Unrelenting Standards / Hypercriticalness",
          persona: "The Perfectionist",
          healthyPersona: "The Excellence Pursuer",
          coreTheme: "Pressure to meet extremely high internal standards; critical stance toward self/others.",
          questions: [
            { id: "5.3.1", order: 97, dimension: "cognitive", text: "I set standards so high that I rarely feel satisfied with outcomes." },
            { id: "5.3.2", order: 98, dimension: "cognitive", text: "I notice flaws quickly and focus on them more than on progress." },
            { id: "5.3.3", order: 99, dimension: "emotional", text: "Shortfalls trigger frustration that is hard to hide." },
            { id: "5.3.4", order: 100, dimension: "emotional", text: "I feel uneasy delegating because others may not meet my bar." },
            { id: "5.3.5", order: 101, dimension: "belief", text: "I believe excellence requires constant pressure and critique." },
            { id: "5.3.6", order: 102, dimension: "belief", text: "I assume relaxing standards risks mediocrity spreading." }
          ]
        },
        {
          variableId: "5.4",
          name: "Punitiveness",
          persona: "The Disciplinarian",
          healthyPersona: "The Fair Accountability Partner",
          coreTheme: "Belief that people should be harshly punished for mistakes; difficulty forgiving.",
          questions: [
            { id: "5.4.1", order: 103, dimension: "cognitive", text: "I tend to frame mistakes as failures of character rather than context." },
            { id: "5.4.2", order: 104, dimension: "cognitive", text: "I think consequences should be felt strongly to drive learning." },
            { id: "5.4.3", order: 105, dimension: "emotional", text: "When someone drops the ball, I feel anger that lingers." },
            { id: "5.4.4", order: 106, dimension: "emotional", text: "Apologies rarely dissolve my frustration after errors occur." },
            { id: "5.4.5", order: 107, dimension: "belief", text: "I believe accountability requires tough responses to mistakes." },
            { id: "5.4.6", order: 108, dimension: "belief", text: "I assume leniency encourages people to cut corners again." }
          ]
        }
      ]
    }
  ]
};

// Export metadata for reference
export const metadata = {
  totalDomains: 5,
  totalSchemas: 18,
  totalItems: 108,
  itemsPerSchema: 6,
  dimensions: ["cognitive", "emotional", "belief"],
  dimensionStructure: "Cognitive (1-2), Emotional (3-4), Belief (5-6)",
  idConvention: "Domain.Schema.Item (string)",
  scaleType: "6-point Likert",
  scaleLabels: [
    "1 = Not at all true of me",
    "2 = Slightly true of me",
    "3 = Somewhat true of me",
    "4 = Moderately true of me",
    "5 = Very true of me",
    "6 = Completely true of me"
  ],
  notes: "All items positively keyed (no reversals). Leadership context questions for reflective coaching."
};
