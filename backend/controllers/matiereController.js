import { createMatiere, deleteMatiereById, getAllMatieres, getAvailableMatieres, getAvailableMatieresByFiliereId, getMatiereById, getMatieresByFiliereId, updateMatiereById } from '../models/matiereModel.js';

export const getMatieres = async (req, res, next) => {
  try {
    const { filiere_id, available } = req.query;
    let matieres;

    if (available === 'true') {
      matieres = filiere_id ? await getAvailableMatieresByFiliereId(filiere_id) : await getAvailableMatieres();
    } else {
      matieres = filiere_id ? await getMatieresByFiliereId(filiere_id) : await getAllMatieres();
    }

    res.json(matieres);
  } catch (error) {
    next(error);
  }
};

export const getMatiere = async (req, res, next) => {
  try {
    const matiere = await getMatiereById(req.params.id);
    if (!matiere) return res.status(404).json({ message: 'Matière introuvable.' });
    res.json(matiere);
  } catch (error) {
    next(error);
  }
};

export const createMatiereHandler = async (req, res, next) => {
  try {
    const { name, description, filiere_id } = req.body;
    if (!name || !filiere_id) {
      return res.status(400).json({ message: 'Le nom et la filière de la matière sont requis.' });
    }
    const matiere = await createMatiere({ name, description, filiere_id });
    res.status(201).json(matiere);
  } catch (error) {
    next(error);
  }
};

export const updateMatiereHandler = async (req, res, next) => {
  try {
    const updatedMatiere = await updateMatiereById(req.params.id, req.body);
    res.json(updatedMatiere);
  } catch (error) {
    next(error);
  }
};

export const deleteMatiereHandler = async (req, res, next) => {
  try {
    await deleteMatiereById(req.params.id);
    res.json({ message: 'Matière supprimée.' });
  } catch (error) {
    next(error);
  }
};
