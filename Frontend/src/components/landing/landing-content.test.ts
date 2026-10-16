import { describe, expect, it } from 'vitest';
import {
  CAREER_TRACKS,
  FAQ_ITEMS,
  FEATURES,
  NAV_LINKS,
  PAIN_POINTS,
  STEPS,
} from './landing-content';

describe('landing-content', () => {
  it('defines valid navigation links', () => {
    expect(NAV_LINKS.length).toBeGreaterThanOrEqual(4);
    for (const link of NAV_LINKS) {
      expect(link.label).toBeTruthy();
      expect(link.href.startsWith('#')).toBe(true);
    }
  });

  it('defines 3 pain points with problem and solution', () => {
    expect(PAIN_POINTS).toHaveLength(3);
    for (const point of PAIN_POINTS) {
      expect(point.problemTitle).toBeTruthy();
      expect(point.problemText).toBeTruthy();
      expect(point.solutionTitle).toBeTruthy();
      expect(point.solutionText).toBeTruthy();
    }
  });

  it('defines 4 core features for the bento grid', () => {
    expect(FEATURES).toHaveLength(4);
    for (const feature of FEATURES) {
      expect(feature.title).toBeTruthy();
      expect(feature.description).toBeTruthy();
      expect(feature.badge).toBeTruthy();
    }
  });

  it('defines 3 sequential steps for how it works', () => {
    expect(STEPS).toHaveLength(3);
    STEPS.forEach((step, index) => {
      expect(step.number).toBe(index + 1);
      expect(step.title).toBeTruthy();
      expect(step.description).toBeTruthy();
    });
  });

  it('defines 8 career tracks with icons', () => {
    expect(CAREER_TRACKS).toHaveLength(8);
    for (const track of CAREER_TRACKS) {
      expect(track.id).toBeTruthy();
      expect(track.name).toBeTruthy();
      expect(track.iconSrc).toBeTruthy();
      expect(track.description).toBeTruthy();
    }
  });

  it('defines at least 5 FAQ questions and answers with no empty values', () => {
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(5);
    for (const faq of FAQ_ITEMS) {
      expect(faq.question).toBeTruthy();
      expect(faq.answer).toBeTruthy();
    }
  });
});
