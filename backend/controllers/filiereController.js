import { createFiliere, deleteFiliereById, getAllFilieres, getFiliereById, updateFiliereById } from '../models/filiereModel.js';
import { createMatiere } from '../models/matiereModel.js';

export const getFilieres = async (req, res, next) => {
  try {
    const filieres = await getAllFilieres();
    res.json(filieres);
  } catch (error) {
    next(error);
  }
};

export const getFiliere = async (req, res, next) => {
  try {
    const filiere = await getFiliereById(req.params.id);
    if (!filiere) return res.status(404).json({ message: 'Filière introuvable.' });
    res.json(filiere);
  } catch (error) {
    next(error);
  }
};

export const createFiliereHandler = async (req, res, next) => {
  try {
    const { name, description, matieres } = req.body;
    if (!name) return res.status(400).json({ message: 'Le nom de la filière est requis.' });
    
    // Créer la filière
    const filiere = await createFiliere({ name, description });
    
    // Créer les matières si elles sont fournies
    if (matieres && Array.isArray(matieres) && matieres.length > 0) {
      for (const matiereData of matieres) {
        if (matiereData.name && matiereData.name.trim()) {
          await createMatiere({
            name: matiereData.name.trim(),
            description: matiereData.description || null,
            filiere_id: filiere.id
          });
        }
      }
    }
    
    res.status(201).json(filiere);
  } catch (error) {
    next(error);
  }
};

export const updateFiliereHandler = async (req, res, next) => {
  try {
    const updatedFiliere = await updateFiliereById(req.params.id, req.body);
    res.json(updatedFiliere);
  } catch (error) {
    next(error);
  }
};

export const deleteFiliereHandler = async (req, res, next) => {
  try {
    await deleteFiliereById(req.params.id);
    res.json({ message: 'Filière supprimée.' });
  } catch (error) {
    next(error);
  }
};
