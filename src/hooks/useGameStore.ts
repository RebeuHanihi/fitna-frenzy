import { create } from 'zustand'
import { supabase } from '@/integrations/supabase/client'

export interface Player {
  id: string
  realName: string
  pseudo: string
  points: number
  hasSubmittedQuestions: boolean
}

export interface Question {
  id: string
  text: string
  targetPlayerName: string
  authorId: string
}

export interface GameRoom {
  id: string
  code: string
  ownerId: string
  ownerName: string
  ownerPseudo: string
  players: Player[]
  availableNames: string[]
  questions: Question[]
  currentQuestionIndex: number
  gamePhase: 'waiting' | 'writing-questions' | 'playing' | 'finished'
  timer: number
}

interface GameState {
  currentRoom: GameRoom | null
  currentPlayer: Player | null
  
  // Actions
  createRoom: (ownerName: string, ownerPseudo: string, availableNames: string[]) => Promise<string>
  joinRoom: (code: string, realName: string, pseudo: string) => Promise<boolean>
  submitQuestions: (questions: string[]) => Promise<void>
  startGame: () => Promise<void>
  drawCard: () => Question | null
  denounce: () => void
  addPoints: (playerId: string, points: number) => Promise<void>
  nextTurn: () => Promise<void>
  endGame: () => Promise<void>
  leaveRoom: () => void
  loadRoomData: (roomId: string) => Promise<void>
}

export const useGameStore = create<GameState>((set, get) => ({
  currentRoom: null,
  currentPlayer: null,

  createRoom: async (ownerName: string, ownerPseudo: string, availableNames: string[]) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    try {
      console.log('Creating room with code:', code)
      
      // Create room in database with null owner_id initially
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .insert({
          code,
          owner_id: '00000000-0000-0000-0000-000000000000', // Temporary UUID
          owner_name: ownerName,
          owner_pseudo: ownerPseudo,
          available_names: availableNames,
        })
        .select()
        .single()

      if (roomError) {
        console.error('Room creation error:', roomError)
        throw roomError
      }

      console.log('Room created:', roomData)

      // Create owner player
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          real_name: ownerName,
          pseudo: ownerPseudo,
        })
        .select()
        .single()

      if (playerError) {
        console.error('Player creation error:', playerError)
        throw playerError
      }

      console.log('Player created:', playerData)

      // Update room with actual owner ID
      const { error: updateError } = await supabase
        .from('game_rooms')
        .update({ owner_id: playerData.id })
        .eq('id', roomData.id)

      if (updateError) {
        console.error('Room update error:', updateError)
        throw updateError
      }

      const owner: Player = {
        id: playerData.id,
        realName: ownerName,
        pseudo: ownerPseudo,
        points: 0,
        hasSubmittedQuestions: false
      }

      const room: GameRoom = {
        id: roomData.id,
        code: roomData.code,
        ownerId: playerData.id,
        ownerName: ownerName,
        ownerPseudo: ownerPseudo,
        players: [owner],
        availableNames,
        questions: [],
        currentQuestionIndex: 0,
        gamePhase: 'waiting',
        timer: 60
      }

      set({ currentRoom: room, currentPlayer: owner })
      console.log('Room creation successful, code:', code)
      return code
    } catch (error) {
      console.error('Error in createRoom:', error)
      throw error
    }
  },

  joinRoom: async (code: string, realName: string, pseudo: string) => {
    try {
      console.log('Attempting to join room with code:', code, 'name:', realName, 'pseudo:', pseudo)
      
      // Find room by code
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()

      console.log('Room query result:', { roomData, roomError })

      if (roomError || !roomData) {
        console.log('Room not found or error occurred')
        return false
      }

      // Check if name is available
      console.log('Available names in room:', roomData.available_names)
      if (!roomData.available_names.includes(realName)) {
        console.log('Name not available:', realName)
        return false
      }

      // Create new player
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          real_name: realName,
          pseudo: pseudo,
        })
        .select()
        .single()

      console.log('Player creation result:', { playerData, playerError })

      if (playerError) throw playerError

      // Load complete room data
      await get().loadRoomData(roomData.id)

      const newPlayer: Player = {
        id: playerData.id,
        realName: realName,
        pseudo: pseudo,
        points: 0,
        hasSubmittedQuestions: false
      }

      set({ currentPlayer: newPlayer })
      console.log('Successfully joined room')
      return true
    } catch (error) {
      console.error('Error joining room:', error)
      return false
    }
  },

  loadRoomData: async (roomId: string) => {
    try {
      // Load room data
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (roomError) throw roomError

      // Load players
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (playersError) throw playersError

      // Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('room_id', roomId)

      if (questionsError) throw questionsError

      const players: Player[] = playersData.map(p => ({
        id: p.id,
        realName: p.real_name,
        pseudo: p.pseudo,
        points: p.points,
        hasSubmittedQuestions: p.has_submitted_questions
      }))

      const questions: Question[] = questionsData.map(q => ({
        id: q.id,
        text: q.text,
        targetPlayerName: q.target_player_name,
        authorId: q.author_id
      }))

      const room: GameRoom = {
        id: roomData.id,
        code: roomData.code,
        ownerId: roomData.owner_id,
        ownerName: roomData.owner_name,
        ownerPseudo: roomData.owner_pseudo,
        players,
        availableNames: roomData.available_names,
        questions,
        currentQuestionIndex: roomData.current_question_index,
        gamePhase: roomData.game_phase as GameRoom['gamePhase'],
        timer: roomData.timer
      }

      set({ currentRoom: room })
    } catch (error) {
      console.error('Error loading room data:', error)
    }
  },

  submitQuestions: async (questionTexts: string[]) => {
    const { currentRoom, currentPlayer } = get()
    if (!currentRoom || !currentPlayer) return

    try {
      const otherPlayers = currentRoom.players.filter(p => p.id !== currentPlayer.id)
      const questions = questionTexts.map((text, index) => ({
        room_id: currentRoom.id,
        author_id: currentPlayer.id,
        text,
        target_player_name: otherPlayers[index]?.realName || '',
      }))

      // Insert questions
      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questions)

      if (questionsError) throw questionsError

      // Update player status
      const { error: playerError } = await supabase
        .from('players')
        .update({ has_submitted_questions: true })
        .eq('id', currentPlayer.id)

      if (playerError) throw playerError

      // Reload room data
      await get().loadRoomData(currentRoom.id)
    } catch (error) {
      console.error('Error submitting questions:', error)
    }
  },

  startGame: async () => {
    const { currentRoom } = get()
    if (!currentRoom) return

    try {
      const { error } = await supabase
        .from('game_rooms')
        .update({ game_phase: 'playing' })
        .eq('id', currentRoom.id)

      if (error) throw error

      set({
        currentRoom: {
          ...currentRoom,
          gamePhase: 'playing'
        }
      })
    } catch (error) {
      console.error('Error starting game:', error)
    }
  },

  drawCard: () => {
    const { currentRoom } = get()
    if (!currentRoom || currentRoom.questions.length === 0) return null

    const availableQuestions = currentRoom.questions.filter((_, index) => 
      index >= currentRoom.currentQuestionIndex
    )
    
    if (availableQuestions.length === 0) return null

    const randomIndex = Math.floor(Math.random() * availableQuestions.length)
    const question = availableQuestions[randomIndex]

    set({
      currentRoom: {
        ...currentRoom,
        currentQuestionIndex: currentRoom.currentQuestionIndex + 1
      }
    })

    return question
  },

  denounce: () => {
    const { currentPlayer } = get()
    if (!currentPlayer) return
    
    get().addPoints(currentPlayer.id, 10)
  },

  addPoints: async (playerId: string, points: number) => {
    const { currentRoom } = get()
    if (!currentRoom) return

    try {
      // Get current player points first
      const { data: playerData, error: getError } = await supabase
        .from('players')
        .select('points')
        .eq('id', playerId)
        .single()

      if (getError) throw getError

      // Update points in database
      const { error } = await supabase
        .from('players')
        .update({ points: (playerData?.points || 0) + points })
        .eq('id', playerId)

      if (error) throw error

      // Update local state
      const updatedPlayers = currentRoom.players.map(p =>
        p.id === playerId ? { ...p, points: p.points + points } : p
      )

      set({
        currentRoom: {
          ...currentRoom,
          players: updatedPlayers
        }
      })
    } catch (error) {
      console.error('Error adding points:', error)
    }
  },

  nextTurn: async () => {
    const { currentRoom } = get()
    if (!currentRoom) return

    try {
      const { error } = await supabase
        .from('game_rooms')
        .update({ timer: 60 })
        .eq('id', currentRoom.id)

      if (error) throw error

      set({
        currentRoom: {
          ...currentRoom,
          timer: 60
        }
      })
    } catch (error) {
      console.error('Error updating timer:', error)
    }
  },

  endGame: async () => {
    const { currentRoom } = get()
    if (!currentRoom) return

    try {
      const { error } = await supabase
        .from('game_rooms')
        .update({ game_phase: 'finished' })
        .eq('id', currentRoom.id)

      if (error) throw error

      set({
        currentRoom: {
          ...currentRoom,
          gamePhase: 'finished'
        }
      })
    } catch (error) {
      console.error('Error ending game:', error)
    }
  },

  leaveRoom: () => {
    set({ currentRoom: null, currentPlayer: null })
  }
}))