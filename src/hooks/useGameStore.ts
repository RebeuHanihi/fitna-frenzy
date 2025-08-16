import { create } from 'zustand'

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
  code: string
  ownerId: string
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
  createRoom: (ownerName: string, ownerPseudo: string, availableNames: string[]) => string
  joinRoom: (code: string, realName: string, pseudo: string) => boolean
  submitQuestions: (questions: string[]) => void
  startGame: () => void
  drawCard: () => Question | null
  denounce: () => void
  addPoints: (playerId: string, points: number) => void
  nextTurn: () => void
  endGame: () => void
  leaveRoom: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  currentRoom: null,
  currentPlayer: null,

  createRoom: (ownerName: string, ownerPseudo: string, availableNames: string[]) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const ownerId = Math.random().toString(36).substring(2, 15)
    
    const owner: Player = {
      id: ownerId,
      realName: ownerName,
      pseudo: ownerPseudo,
      points: 0,
      hasSubmittedQuestions: false
    }

    const room: GameRoom = {
      code,
      ownerId,
      players: [owner],
      availableNames,
      questions: [],
      currentQuestionIndex: 0,
      gamePhase: 'waiting',
      timer: 60
    }

    set({ currentRoom: room, currentPlayer: owner })
    return code
  },

  joinRoom: (code: string, realName: string, pseudo: string) => {
    const { currentRoom } = get()
    // Simulation - in real app this would check if room exists
    if (!currentRoom || currentRoom.code !== code) {
      return false
    }

    const playerId = Math.random().toString(36).substring(2, 15)
    const newPlayer: Player = {
      id: playerId,
      realName,
      pseudo,
      points: 0,
      hasSubmittedQuestions: false
    }

    const updatedRoom = {
      ...currentRoom,
      players: [...currentRoom.players, newPlayer]
    }

    set({ currentRoom: updatedRoom, currentPlayer: newPlayer })
    return true
  },

  submitQuestions: (questionTexts: string[]) => {
    const { currentRoom, currentPlayer } = get()
    if (!currentRoom || !currentPlayer) return

    const otherPlayers = currentRoom.players.filter(p => p.id !== currentPlayer.id)
    const newQuestions: Question[] = questionTexts.map((text, index) => ({
      id: Math.random().toString(36).substring(2, 15),
      text,
      targetPlayerName: otherPlayers[index]?.realName || '',
      authorId: currentPlayer.id
    }))

    const updatedPlayer = { ...currentPlayer, hasSubmittedQuestions: true }
    const updatedPlayers = currentRoom.players.map(p => 
      p.id === currentPlayer.id ? updatedPlayer : p
    )

    const updatedRoom = {
      ...currentRoom,
      players: updatedPlayers,
      questions: [...currentRoom.questions, ...newQuestions]
    }

    set({ currentRoom: updatedRoom, currentPlayer: updatedPlayer })
  },

  startGame: () => {
    const { currentRoom } = get()
    if (!currentRoom) return

    set({
      currentRoom: {
        ...currentRoom,
        gamePhase: 'playing'
      }
    })
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

  addPoints: (playerId: string, points: number) => {
    const { currentRoom } = get()
    if (!currentRoom) return

    const updatedPlayers = currentRoom.players.map(p =>
      p.id === playerId ? { ...p, points: p.points + points } : p
    )

    set({
      currentRoom: {
        ...currentRoom,
        players: updatedPlayers
      }
    })
  },

  nextTurn: () => {
    const { currentRoom } = get()
    if (!currentRoom) return

    set({
      currentRoom: {
        ...currentRoom,
        timer: 60
      }
    })
  },

  endGame: () => {
    const { currentRoom } = get()
    if (!currentRoom) return

    set({
      currentRoom: {
        ...currentRoom,
        gamePhase: 'finished'
      }
    })
  },

  leaveRoom: () => {
    set({ currentRoom: null, currentPlayer: null })
  }
}))