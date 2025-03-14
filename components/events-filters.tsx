"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EventsFilters({ onFilterChange }: { onFilterChange?: (filters: any) => void }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [matchThreshold, setMatchThreshold] = useState([70])
  const [selectedTagValue, setSelectedTagValue] = useState("placeholder")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("any")
  const [locationFilter, setLocationFilter] = useState("any")

  const allTags = [
    "Deep Learning",
    "NLP",
    "Computer Vision",
    "AI Ethics",
    "Reinforcement Learning",
    "Neural Networks",
    "Machine Learning",
    "Research",
    "Hackathon",
    "Workshop",
    "Meetup",
    "Panel",
    "Virtual",
  ]

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag]
      setSelectedTags(newTags)

      if (onFilterChange) {
        onFilterChange({
          tags: newTags,
          search: searchQuery,
          date: dateFilter,
          location: locationFilter,
          threshold: matchThreshold[0],
        })
      }
    }
  }

  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter((t) => t !== tag)
    setSelectedTags(newTags)

    if (onFilterChange) {
      onFilterChange({
        tags: newTags,
        search: searchQuery,
        date: dateFilter,
        location: locationFilter,
        threshold: matchThreshold[0],
      })
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)

    if (onFilterChange) {
      onFilterChange({
        tags: selectedTags,
        search: e.target.value,
        date: dateFilter,
        location: locationFilter,
        threshold: matchThreshold[0],
      })
    }
  }

  const handleDateChange = (value: string) => {
    setDateFilter(value)

    if (onFilterChange) {
      onFilterChange({
        tags: selectedTags,
        search: searchQuery,
        date: value,
        location: locationFilter,
        threshold: matchThreshold[0],
      })
    }
  }

  const handleLocationChange = (value: string) => {
    setLocationFilter(value)

    if (onFilterChange) {
      onFilterChange({
        tags: selectedTags,
        search: searchQuery,
        date: dateFilter,
        location: value,
        threshold: matchThreshold[0],
      })
    }
  }

  const handleThresholdChange = (value: number[]) => {
    setMatchThreshold(value)

    if (onFilterChange) {
      onFilterChange({
        tags: selectedTags,
        search: searchQuery,
        date: dateFilter,
        location: locationFilter,
        threshold: value[0],
      })
    }
  }

  const clearAllFilters = () => {
    setSelectedTags([])
    setSelectedTagValue("placeholder")
    setSearchQuery("")
    setDateFilter("any")
    setLocationFilter("any")
    setMatchThreshold([70])

    if (onFilterChange) {
      onFilterChange({
        tags: [],
        search: "",
        date: "any",
        location: "any",
        threshold: 70,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input id="search" placeholder="Search events..." value={searchQuery} onChange={handleSearchChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Select value={dateFilter} onValueChange={handleDateChange}>
            <SelectTrigger id="date">
              <SelectValue placeholder="Any date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any date</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This week</SelectItem>
              <SelectItem value="this-month">This month</SelectItem>
              <SelectItem value="next-month">Next month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select value={locationFilter} onValueChange={handleLocationChange}>
            <SelectTrigger id="location">
              <SelectValue placeholder="Any location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any location</SelectItem>
              <SelectItem value="on-campus">On campus</SelectItem>
              <SelectItem value="off-campus">Off campus</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tag-select">Add Tag</Label>
          <Select
            value={selectedTagValue}
            onValueChange={(value) => {
              setSelectedTagValue(value)
              // Only add if not the placeholder value
              if (value !== "placeholder") {
                addTag(value)
                // Reset to placeholder after selection
                setTimeout(() => setSelectedTagValue("placeholder"), 100)
              }
            }}
          >
            <SelectTrigger id="tag-select">
              <SelectValue placeholder="Select tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder" disabled>
                Select tag
              </SelectItem>
              {allTags
                .filter((tag) => !selectedTags.includes(tag))
                .map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>AI Match Threshold: {matchThreshold}%</Label>
        </div>
        <Slider defaultValue={[70]} max={100} step={5} value={matchThreshold} onValueChange={handleThresholdChange} />
      </div>
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTag(tag)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag}</span>
              </Button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}

