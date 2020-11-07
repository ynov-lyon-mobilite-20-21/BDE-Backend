/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';
import {
  deleteOnyBy,
  findManyBy, findOneBy, saveData, updateOneBy,
} from '../services/MongooseService';
import { Ticket, TicketModel } from '../models/TicketModel';
import { getUserIdByToken } from '../services/UserService';

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  const { userId, eventId, paymentId } = req.body;

  if (!userId) {
    res.status(400).json({
      data: {},
      error: { code: 'USERID_REQUIRED' },
    });

    return;
  }
  if (!eventId) {
    res.status(400).json({
      data: {},
      error: { code: 'EVENTID_REQUIRED' },
    });

    return;
  }
  if (!paymentId) {
    res.status(400).json({
      data: {},
      error: { code: 'PAYMENTID_REQUIRED' },
    });

    return;
  }

  let ticket = await findOneBy<Ticket>({ model: TicketModel, condition: { userId, eventId, paymentId } });

  if (ticket) {
    res.status(400).json({
      data: {},
      error: { code: 'TICKET_ALREADY_EXISTS' },
    });

    return;
  }

  ticket = await saveData<Ticket>({
    model: TicketModel,
    params: { userId, eventId, paymentId },
  });

  if (!ticket) {
    res.status(400).json({
      data: {},
      error: { code: 'UNKNOWN_ERROR', message: 'An error has occured while ticket creation in database' },
    });

    return;
  }

  res.status(200).json({
    data: {
      code: 'OK',
      message: 'Ticket created successfully',
    },
  });
};

export const getTickets = async (req: Request, res: Response): Promise<void> => {
  const userId = await getUserIdByToken(req.headers.authorization!);
  const tickets = await findManyBy<Ticket>({ model: TicketModel, condition: { userId } });

  res.status(200).json({
    data: tickets,
  });
};

export const getTicketById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const userId = await getUserIdByToken(req.headers.authorization!);

  const ticket = await findOneBy<Ticket>({ model: TicketModel, condition: { _id: id, userId } });

  res.status(200).json({
    data: ticket,
  });
};

export const updateTicketById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const ticket = req.body;

  const userId = await getUserIdByToken(req.headers.authorization!);

  const updatedTicket = await updateOneBy<Ticket>({ model: TicketModel, condition: { _id: id, userId }, set: ticket });

  if (!updatedTicket) {
    res.status(500).json({
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Impossible to update the ticket',
      },
    });

    return;
  }

  res.status(200).json({
    data: {
      message: 'Ticket updated successfully !',
    },
  });
};

export const deleteTicketById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const userId = await getUserIdByToken(req.headers.authorization!);

  const ticket = await deleteOnyBy<Ticket>({ model: TicketModel, condition: { _id: id, userId } });

  if (!ticket) {
    res.status(500).json({
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Impossible to delete ticket',
      },
    });

    return;
  }

  res.status(200).json({
    data: {
      message: 'Ticket deleted successfully !',
    },
  });
};