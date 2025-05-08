// CommentForm.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import axios from 'axios';

const ALLOWED_TAGS = ['a', 'code', 'i', 'strong']
const CAPTCHA_LENGTH = 5

function generateCaptcha(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array.from({ length: CAPTCHA_LENGTH }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function sanitizeText(input: string): string {
    const parser = new DOMParser()
    const doc = parser.parseFromString(`<div>${input}</div>`, 'text/html')
    const allowed = ALLOWED_TAGS

    const cleanNode = (node: Node): Node => {
        if (node.nodeType === Node.TEXT_NODE) return node.cloneNode()

        if (
            node.nodeType === Node.ELEMENT_NODE &&
            allowed.includes((node as Element).tagName.toLowerCase())
        ) {
            const clone = node.cloneNode() as HTMLElement
            clone.innerHTML = ''
            node.childNodes.forEach((child) => clone.appendChild(cleanNode(child)))
            for (const attr of (node as Element).attributes) {
                if (['href', 'title'].includes(attr.name)) clone.setAttribute(attr.name, attr.value)
            }
            return clone
        }
        return document.createTextNode(node.textContent || '')
    }

    const sanitized = document.createElement('div')
    doc.body.firstChild?.childNodes.forEach((node) => sanitized.appendChild(cleanNode(node)))
    return sanitized.innerHTML
}

type FormData = {
    userName: string
    email: string
    homepage: string
    text: string
    captcha: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

export default function CommentForm({parent_id}: {parent_id?: number}) {
    const [form, setForm] = useState<FormData>({
        userName: '',
        email: '',
        homepage: '',
        text: '',
        captcha: '',
    })
    const [captchaValue, setCaptchaValue] = useState<string>('')
    const [errors, setErrors] = useState<FormErrors>({})

    useEffect(() => {
        setCaptchaValue(generateCaptcha())
    }, [])

    const validate = (): FormErrors => {
        const errs: FormErrors = {}
        if (!/^[a-zA-Z0-9]+$/.test(form.userName)) errs.userName = 'Only latin letters and digits allowed'
        if (!form.userName) errs.userName = 'Required'
        if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Invalid email'
        if (form.homepage && !/^https?:\/\/.+/.test(form.homepage)) errs.homepage = 'Invalid URL'
        if (!form.text) errs.text = 'Required'
        if (form.captcha !== captchaValue) errs.captcha = 'CAPTCHA mismatch'
        return errs
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const errs = validate()
        setErrors(errs)
        if (Object.keys(errs).length !== 0) {
            //TODO Show error
        }

        axios.post(route('comments.store'), {
            parent_id: parent_id,
            text: sanitizeText(form.text),
            user_email: form.email,
            username: form.userName,
            user_home_page_url: form.homepage ? form.homepage : ''
        }).then(r => {});
    }

    return (
        <div className="max-w-xl mx-auto space-y-4 p-4">
            <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-white shadow-md p-4 rounded-xl"
            >
                <div>
                    <label className="block">User Name *</label>
                    <input
                        type="text"
                        name="userName"
                        value={form.userName}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                    {errors.userName && <p className="text-red-500 text-sm">{errors.userName}</p>}
                </div>

                <div>
                    <label className="block">Email *</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                <div>
                    <label className="block">Homepage (optional)</label>
                    <input
                        type="url"
                        name="homepage"
                        value={form.homepage}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                    {errors.homepage && <p className="text-red-500 text-sm">{errors.homepage}</p>}
                </div>

                <div>
                    <label className="block">Comment *</label>
                    <textarea
                        name="text"
                        value={form.text}
                        onChange={handleChange}
                        rows={4}
                        className="w-full border p-2 rounded"
                    ></textarea>
                    {errors.text && <p className="text-red-500 text-sm">{errors.text}</p>}
                </div>

                <div>
                    <label className="block">CAPTCHA *</label>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-lg bg-gray-100 px-3 py-1 rounded">{captchaValue}</span>
                        <input
                            type="text"
                            name="captcha"
                            value={form.captcha}
                            onChange={handleChange}
                            className="flex-1 border p-2 rounded"
                        />
                    </div>
                    {errors.captcha && <p className="text-red-500 text-sm">{errors.captcha}</p>}
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Submit
                </button>
            </form>
        </div>
    )
}
