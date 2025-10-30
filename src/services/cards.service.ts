import { supabaseAdmin } from '../db/supabase';

export class CardsService {
  static async getAllCards() {
    const { data, error } = await supabaseAdmin
      .from('cards')
      .select('*')
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch cards: ${error.message}`);
    }

    return data;
  }

  static async getActiveCards() {
    const { data, error } = await supabaseAdmin
      .from('cards')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch active cards: ${error.message}`);
    }

    return data;
  }

  static async getCardById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('cards')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(`Card not found: ${error.message}`);
    }
    
    return data;
  }

  static async createCard(data: any) {
    // Support both camelCase and snake_case field names
    const cardNumber = data.card_number || data.cardNumber;
    const cardHolder = data.card_holder_name || data.card_holder || data.cardHolder;
    const cardType = data.card_type || data.cardType || 'credit';
    const issuer = data.issuer || data.bank || '';
    const expiryDate = data.expiry_date || data.expiryDate || null;
    const creditLimit = data.credit_limit || data.cardLimit || data.card_limit || 0;
    const balance = data.balance || 0;
    const isActive = data.is_active !== undefined ? data.is_active : (data.isActive !== undefined ? data.isActive : true);

    // Check if card number already exists
    const { data: existingCard } = await supabaseAdmin
      .from('cards')
      .select('id')
      .eq('card_number', cardNumber)
      .single();
    
    if (existingCard) {
      throw new Error('Card number already exists');
    }

    const cardData = {
      card_number: cardNumber,
      card_holder: cardHolder,
      card_type: cardType,
      bank: issuer,
      expiry_date: expiryDate,
      card_limit: creditLimit,
      balance: balance,
      is_active: isActive,
    };

    const { data: newCard, error } = await supabaseAdmin
      .from('cards')
      .insert(cardData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create card: ${error.message}`);
    }

    return newCard;
  }

  static async updateCard(id: string, data: any) {
    // If card number is being updated, check for duplicates
    if (data.cardNumber) {
      const { data: existingCard } = await supabaseAdmin
        .from('cards')
        .select('id')
        .eq('card_number', data.cardNumber)
        .neq('id', id)
        .single();
      
      if (existingCard) {
        throw new Error('Card number already exists');
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (data.cardNumber !== undefined) updateData.card_number = data.cardNumber;
    if (data.cardHolder !== undefined) updateData.card_holder = data.cardHolder;
    if (data.cardType !== undefined) updateData.card_type = data.cardType;
    if (data.bank !== undefined) updateData.bank = data.bank;
    if (data.expiryDate !== undefined) updateData.expiry_date = data.expiryDate;
    if (data.cardLimit !== undefined) updateData.card_limit = data.cardLimit;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const { data: updatedCard, error } = await supabaseAdmin
      .from('cards')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update card: ${error.message}`);
    }

    return updatedCard;
  }

  static async deleteCard(id: string) {
    // Check if card has associated bills
    const { count, error: countError } = await supabaseAdmin
      .from('bills')
      .select('*', { count: 'exact', head: true })
      .eq('card_id', id);
    
    if (countError) {
      throw new Error(`Failed to check card usage: ${countError.message}`);
    }

    if (count && count > 0) {
      throw new Error('Cannot delete card with associated bills. Deactivate instead.');
    }

    const { error } = await supabaseAdmin
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete card: ${error.message}`);
    }

    return { success: true, message: 'Card deleted successfully' };
  }

  static async deactivateCard(id: string) {
    const { data, error } = await supabaseAdmin
      .from('cards')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to deactivate card: ${error.message}`);
    }

    return data;
  }

  static async getCardBalance(id: string) {
    // Get card details
    const { data: card, error: cardError } = await supabaseAdmin
      .from('cards')
      .select('*')
      .eq('id', id)
      .single();

    if (cardError) {
      throw new Error(`Card not found: ${cardError.message}`);
    }

    // Get transaction stats
    const { data: bills, error: billsError } = await supabaseAdmin
      .from('bills')
      .select('amount')
      .eq('card_id', id);

    if (billsError) {
      throw new Error(`Failed to fetch bills: ${billsError.message}`);
    }

    const totalSpent = bills?.reduce((sum, bill) => sum + Number(bill.amount), 0) || 0;

    return {
      ...card,
      available_limit: Number(card.card_limit) - Number(card.balance),
      total_transactions: bills?.length || 0,
      total_spent: totalSpent,
    };
  }

  static async getCardStats() {
    const { data: cards, error } = await supabaseAdmin
      .from('cards')
      .select('balance, card_limit, is_active');

    if (error) {
      throw new Error(`Failed to fetch card stats: ${error.message}`);
    }

    const stats = {
      total_cards: cards.length,
      active_cards: cards.filter(c => c.is_active).length,
      total_balance: cards.reduce((sum, c) => sum + Number(c.balance), 0),
      total_limit: cards.reduce((sum, c) => sum + Number(c.card_limit), 0),
      total_available: cards.reduce((sum, c) => sum + (Number(c.card_limit) - Number(c.balance)), 0),
    };
    
    return stats;
  }
}
