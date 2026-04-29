import { getAllUsers, getUserById, updateUserStatus, deleteUserById } from '../models/userModel.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json(users.map((user) => ({ ...user, password: undefined })));
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ ...user, password: undefined });
  } catch (error) {
    next(error);
  }
};

export const suspendAccount = async (req, res, next) => {
  try {
    await updateUserStatus(req.params.id, 'suspended');
    res.json({ message: 'Compte suspendu.' });
  } catch (error) {
    next(error);
  }
};

export const blockAccount = async (req, res, next) => {
  try {
    await updateUserStatus(req.params.id, 'blocked');
    res.json({ message: 'Compte bloqué.' });
  } catch (error) {
    next(error);
  }
};

export const unblockAccount = async (req, res, next) => {
  try {
    await updateUserStatus(req.params.id, 'active');
    res.json({ message: 'Compte débloqué.' });
  } catch (error) {
    next(error);
  }
};

export const removeAccount = async (req, res, next) => {
  try {
    await deleteUserById(req.params.id);
    res.json({ message: 'Compte supprimé.' });
  } catch (error) {
    next(error);
  }
};
