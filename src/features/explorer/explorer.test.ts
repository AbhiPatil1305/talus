import { describe, it, expect } from 'vitest';
import {
  ANATOMICAL_STRUCTURES,
  SYSTEM_CATEGORIES,
  getStructuresBySystem,
  searchStructures,
} from './anatomyMetadata';

describe('TALUS 3D Human Anatomy Explorer Metadata & Ontology', () => {
  it('ensures all anatomical structures have verified scientific fields', () => {
    expect(ANATOMICAL_STRUCTURES.length).toBeGreaterThan(10);

    for (const struct of ANATOMICAL_STRUCTURES) {
      expect(struct.id).toBeTruthy();
      expect(struct.name).toBeTruthy();
      expect(struct.latinName).toBeTruthy();
      expect(struct.system).toBeTruthy();
      expect(struct.meshName).toBeTruthy();
      expect(struct.modelUrl).toMatch(/\.glb$/);
      expect(struct.function.length).toBeGreaterThan(15);
      expect(struct.clinicalRelevance.length).toBeGreaterThan(15);
    }
  });

  it('filters structures by anatomical system correctly', () => {
    const cardio = getStructuresBySystem('cardiovascular');
    expect(cardio.length).toBeGreaterThan(4);
    expect(cardio.every((s) => s.system === 'cardiovascular')).toBe(true);

    const skeletal = getStructuresBySystem('skeletal');
    expect(skeletal.length).toBeGreaterThan(4);
    expect(skeletal.every((s) => s.system === 'skeletal')).toBe(true);

    const respiratory = getStructuresBySystem('respiratory');
    expect(respiratory.length).toBeGreaterThan(2);
    expect(respiratory.every((s) => s.system === 'respiratory')).toBe(true);

    const all = getStructuresBySystem('all');
    expect(all.length).toBe(ANATOMICAL_STRUCTURES.length);
  });

  it('searches structures by common name and Latin nomenclature', () => {
    // English name search
    const aortaResults = searchStructures('Aorta');
    expect(aortaResults.some((s) => s.name === 'Ascending Aorta')).toBe(true);
    expect(aortaResults.some((s) => s.name === 'Aortic Arch')).toBe(true);

    // Latin name search
    const latinResults = searchStructures('Arcus aortae');
    expect(latinResults.some((s) => s.latinName === 'Arcus aortae')).toBe(true);

    // Category / function search
    const coronaryResults = searchStructures('widowmaker');
    expect(coronaryResults.some((s) => s.id === 'struct_lad_artery')).toBe(true);
  });

  it('ensures anatomical categories match system counts', () => {
    for (const cat of SYSTEM_CATEGORIES) {
      if (cat.id === 'all') {
        expect(cat.count).toBe(ANATOMICAL_STRUCTURES.length);
      } else {
        const matching = ANATOMICAL_STRUCTURES.filter((s) => s.system === cat.id);
        expect(cat.count).toBe(matching.length);
      }
    }
  });

  it('links critical surgical anatomical structures to training procedures', () => {
    const ascendingAorta = ANATOMICAL_STRUCTURES.find(
      (s) => s.id === 'struct_ascending_aorta'
    );
    expect(ascendingAorta?.surgicalProcedureId).toBe('proc_cardiac_cabg_03');

    const lad = ANATOMICAL_STRUCTURES.find((s) => s.id === 'struct_lad_artery');
    expect(lad?.surgicalProcedureId).toBe('proc_cardiac_cabg_03');
  });

  it('validates AVAILABLE_MODELS registry and ANATOMICAL_ASSET_MANIFEST transparency', async () => {
    const { AVAILABLE_MODELS } = await import('./anatomyMetadata');
    const { ANATOMICAL_ASSET_MANIFEST } = await import('./assetManifest');

    expect(AVAILABLE_MODELS.length).toBeGreaterThanOrEqual(4);
    for (const model of AVAILABLE_MODELS) {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(model.url).toMatch(/\.glb$/);
      expect(model.structureCount).toBeGreaterThan(0);
    }

    const heartAsset = ANATOMICAL_ASSET_MANIFEST['human_heart_nih'];
    expect(heartAsset).toBeDefined();
    expect(heartAsset.isScientificallyVerified).toBe(true);
    expect(heartAsset.license).toContain('CC-BY 4.0');
    expect(heartAsset.verifiedMeshIdentifiers.length).toBeGreaterThan(5);
  });
});

