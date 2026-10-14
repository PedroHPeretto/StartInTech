import { describe, expect, it } from 'vitest';
import { CAREER_TRACK_CATALOG } from '../src/career-tracks/career-track.catalog.js';
import {
  CANONICAL_SKILL_DEFINITIONS,
  CAREER_ROADMAP_SEEDS,
  ROADMAP_NODE_SEEDS,
} from '../src/roadmaps/roadmap.catalog.js';

describe('Roadmap Catalog & Skill Mappings', () => {
  it('defines a roadmap for every catalog career track', () => {
    const trackSlugs = CAREER_TRACK_CATALOG.map((track) => track.slug).sort();
    const roadmapSlugs = CAREER_ROADMAP_SEEDS.map(
      (seed) => seed.careerSlug,
    ).sort();
    expect(roadmapSlugs).toEqual(trackSlugs);
  });

  it('contains exactly 74 nodes with unique IDs', () => {
    expect(ROADMAP_NODE_SEEDS).toHaveLength(74);
    const ids = new Set(ROADMAP_NODE_SEEDS.map((node) => node.id));
    expect(ids.size).toBe(74);
  });

  it('maps each non-neutral topic to a recognized canonical skill definition', () => {
    const canonicalSkillNames = new Set(
      CANONICAL_SKILL_DEFINITIONS.map((def) => def.name.toLowerCase()),
    );

    const nodesWithSkill = ROADMAP_NODE_SEEDS.filter(
      (node) => node.skillName !== null && node.skillName !== undefined,
    );

    expect(nodesWithSkill.length).toBeGreaterThanOrEqual(40);

    for (const node of nodesWithSkill) {
      expect(
        canonicalSkillNames.has(node.skillName!.toLowerCase()),
        `Unknown skill "${node.skillName}" on node "${node.title}"`,
      ).toBe(true);
    }
  });

  it('ensures each career track has at least 5 trackable skill nodes', () => {
    for (const roadmap of CAREER_ROADMAP_SEEDS) {
      const nodesForRoadmap = ROADMAP_NODE_SEEDS.filter(
        (node) => node.roadmapId === roadmap.id && Boolean(node.skillName),
      );
      expect(
        nodesForRoadmap.length,
        `Track ${roadmap.careerSlug} should have at least 5 trackable nodes`,
      ).toBeGreaterThanOrEqual(5);
    }
  });

  it('has unique skill associations within the same career track', () => {
    for (const roadmap of CAREER_ROADMAP_SEEDS) {
      const skillsInTrack = ROADMAP_NODE_SEEDS.filter(
        (node) => node.roadmapId === roadmap.id && Boolean(node.skillName),
      ).map((node) => node.skillName!.toLowerCase());

      const uniqueSkills = new Set(skillsInTrack);
      expect(uniqueSkills.size).toBe(skillsInTrack.length);
    }
  });
});
